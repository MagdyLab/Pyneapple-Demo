# imports
import sys
import os

# Set root directory
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_root)

from fastapi import FastAPI, Depends, File, UploadFile
from read_shapefile import read_shapefile
from Pyneapple.pyneapple.weight.rook import from_dataframe as rook
from Pyneapple.pyneapple.regionalization.expressive_maxp import expressive_maxp
from Pyneapple.pyneapple.regionalization.maxp import maxp
from Pyneapple.pyneapple.regionalization.generalized_p import generalized_p
from Pyneapple.pyneapple.regionalization.scalable_maxp import scalable_maxp
import uvicorn
import json
from typing import Dict, Union
import openai
from dotenv import load_dotenv
import requests
import geopandas as gpd
import jpype
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from pydantic import BaseModel
import math
import numpy as np
from libpysal.weights import Queen, Rook
from spopt.region.maxp import maxp as libMaxP
import time

# Initialize fastAPI app
app = FastAPI()

# Add CORS middleware ( Allow access to backend endpoints)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # Allows CORS from this origin
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods
    allow_headers=["*"],
)

# GPT-Backend

# Import openAI API key for using GPT
openai.api_key = os.getenv('OPENAI_API_KEY')
# print(openai.api_key)

# Define Data directory
data_dir = "../testData"

# Define functions which GPT API can call and details
function_descriptions = [
            {
                "name": "maxp",
                "description": "Clustering a set of geographic areas into the maximum number of homogeneous regions that satisfies a set of user defined constraints. The number of regions to partition is determined by the parameters and conditions.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        
                        "sumName": {
                            "type": "string",
                            "description": "The name of the spatial extensive attribute variable for the SUM constraint, usually the central component parameter to fetermine the regionalization.",
                            #"enum": ["pop2010", "pop_16up"]
                        },
                        "sumLow": {
                            "type": "integer",
                            "descripition": "The lowerbound for the SUM range."
                            
                        },
                        "sumHigh": {
                            "type": "integer",
                            "descripition": "The upperbound for the SUM range."
                        },
                        "disname": {
                            "type": "string",
                            "descripition": "The dissimlarity attribute"
                        },
                        "minName": {
                            "type": "string",
                            "descripition": " The name of the spatial extensive attribute variable for the MIN constraint"
                        },
                        "minLow": {
                            "type": "integer",
                            "descripition": " The lowerbound for the MIN range"
                        },
                        "minHigh": {
                            "type": "integer",
                            "descripition": " The upperbound for the MIN range"
                        },
                        "maxName": {
                            "type": "string",
                            "descripition": " The name of the spatial extensive attribute variable for the MAX constraint"
                        },
                        "maxLow": {
                            "type": "integer",
                            "descripition": " The lowerbound for the MAX range"
                        },
                        "maxHigh": {
                            "type": "integer",
                            "descripition": " The upperbound for the MAX range"
                        },
                        "avgName": {
                            "type": "string",
                            "descripition": "The name of the spatial extensive attribute variable for the AVG constraint"
                        },
                        "avgLow": {
                            "type": "integer",
                            "descripition": "The lowerbound for the AVG range."
                        },
                        "avgHigh": {
                            "type": "integer",
                            "descripition": "The upperbound for the AVG range."
                        },
                        "countLow": {
                            "type": "integer",
                            "descripition": "The lowerbound for the COUNT range."
                        },
                        "countHigh": {
                            "type": "integer",
                            "descripition": "The upperbound for the COUNT range."
                        },

                    },
                    "required": ["disname", "sumName", "sumLow", "sumHigh"],
                },
            },
            {
                "name": "generalized_p",
                "description": "Clustering a set of geographic areas into the fixed given number of homogeneous regions based on one constraint and one optimization parameter. Only used when the number of regions to partition the given dataset is mentioned in the user query. ",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "sim_attr": {
                            "type": "string",
                            "description": "The name of the attribute to measure the heterogeneity used for optimization",
                            
                        },
                        "ext_attr": {
                            "type": "string",
                            "description": "The name of the attribute to measure the spatial extensive attribute used as a constraint",    
                        },
                        "threshold": {
                            "type": "integer",
                            "description": "The threshold value enforced on each region with regards to the extensive attribute constraint",    
                        },
                        "p": {
                            "type": "integer",
                            "description": "The pre-defined number of regions",    
                        },
                    },
                    "required": ["sim_attr", "ext_attr", "threshold", "p"],
                },
            },

        ]

# Path for storing shapefile descriptions
DESCRIPTIONS_JSON = '../testdata/descriptions.json'


# Function to use GPT to generate column description
def generate_column_descriptions(df_context: str) -> dict:
    # Here, you call GPT-3 API to generate a detailed description for columns
    chat_history = [
        {"role": "system", "content": "You are a helpful assistant"},
        {"role": "user", "content": "Describe each of the following dataframe columns in detail: " + df_context}
    ]

    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo-16k-0613",
        messages=chat_history
    )

    detailed_description = response["choices"][0]["message"]["content"]
    return detailed_description


# End point to generate the column description everytime a file is loaded
@app.get("/gpt_end_point/generate_description/{file_name}")
def generate_description(file_name: str) -> dict:
    # If the descriptions file exists, load it
    if os.path.exists(DESCRIPTIONS_JSON):
        with open(DESCRIPTIONS_JSON, 'r') as f:
            descriptions = json.load(f)
    else:
        descriptions = {}

    # If the description already exists, return it
    if file_name in descriptions:
        return {"status": "exists", "description": descriptions[file_name]}

    df = read_shapefile(data_dir, file_name)
    filtered_columns = [col for col in df.columns if col not in ['geometry', 'OBJECTID', 'GEOID10']]
    df_context = str(filtered_columns)

    # Generate detailed descriptions for the columnsb 
    column_descriptions = generate_column_descriptions(df_context)

    descriptions[file_name] = column_descriptions

    # Save the updated descriptions
    with open(DESCRIPTIONS_JSON, 'w') as f:
        json.dump(descriptions, f)

    return {"status": "created", "description": column_descriptions}


# Function to retrieve column description
def get_description(file_name: str) -> str:
    with open(DESCRIPTIONS_JSON, 'r') as f:
        descriptions = json.load(f)
        
    return descriptions.get(file_name, "")

# Endpoint to call GPT workflow to process user query


@app.get("/gpt_end_point/process_query")
def gpt_process_query(user_query: str, file_name: str):

    df_context = get_description(file_name)
    
    # If no description exists, it means it hasn't been generated before. 
    if not df_context:
        return {"error": "Description not found for the given file_name"}
    print("File description: ", df_context)

    chat_history = []
    chat_history.append({"role": "system","content": "Only choose from the functions provided to you. Default values for lower bound parameters is negative infinty and upper bound is infintiy. Only use ',' as a delimeter for larger integers"})
    chat_history.append({"role": "system", "content": "Function generalized_p is chosen if the number of regions to partition the dataset is mentioned by the user. If the number of regions/partitions are not mentioned you should choose the function maxp"})
    chat_history.append({"role": "system", "content": "Make sure to choose the required string parameters for each function."})
    
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo-16k-0613",

        # This is the chat message from the user
        messages = chat_history + [{"role": "user", "content": "Respond with an appropiate function call where arguments match a certain column name for the given the user query : " + user_query + "given the column description: " + df_context}],

        functions=function_descriptions,
        function_call="auto",
    )

    ai_response_message = response["choices"][0]["message"]
    print("Initial response Message: ", ai_response_message)
   
    if "function_call" in ai_response_message:
        callingFunction = ai_response_message['function_call']['name']
        print("Calling Function is : ", callingFunction)
        parameters = json.loads(ai_response_message["function_call"]["arguments"])
        print("Parameters chosen by GPT are : ", parameters)
    else:
        print("In the validation function")
        validate_function_call = openai.ChatCompletion.create(
            model="gpt-3.5-turbo-16k-0613",
            # This is the chat message from the user
            messages=[{"role": "user", "content": "Respond only with the filled dictionary {'calling_function': , 'arguments': {} } based on the response " + ai_response_message["content"] + "available function names are either maxp or generalized_p"}],
            
        )

        validate_function_response = validate_function_call["choices"][0]["message"]
        print("Validation Response: ", validate_function_response)

        # Convert the 'content' string to a dictionary
        fixed_json_str = validate_function_response["content"].replace("'", "\"")
        content_dict = json.loads(fixed_json_str)
        print("Content dictionary: ", content_dict)

        # Extract the values from the dictionary
        callingFunction = content_dict["calling_function"]
        print("Validated function call: ", callingFunction)

        parameters = content_dict["arguments"]
        print("Parameters chosen by function validator: ", parameters)
        # print(str(parameters))

    try:
        if callingFunction == "maxp":
            function_response = GPTmaxPEndPoint(parameters, file_name)
            function_response_data = json.loads(function_response)
            plotLabels = function_response_data['labels']
            print(type(plotLabels))

        elif callingFunction == "generalized_p":
            function_response = gpEndPoint(parameters, file_name)
            function_response_data = json.loads(function_response)

    except Exception as e:
        # Handle the exception
        error_message = str(e)
        print("Error: ", error_message)
        gptResult = {"gptResponse": "An error occurred: " + error_message + ". Please try again.", "plot": '[]'}
        print(gptResult)
        return gptResult

    evaluate_function_response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo-16k-0613",

        # This is the chat message from the user
        messages=chat_history + [{"role": "user", "content": "The function returns : " + function_response + "explain the results of the user query in 2 lines which is shown by the plotted map"}],

    )

    gptResult = {"gptResponse": evaluate_function_response['choices'][0]['message']['content'], "plot": function_response}
    print(gptResult)
    return gptResult


# End point for backend maxP function
@app.post("/api/endpoint")
def GPTmaxPEndPoint(parameters: Dict[str, Union[float, str]], filename: str):

    df = read_shapefile(data_dir, filename)
    w = rook(df)

    parameters_required = {
        "disname": None,
        "minName": None,
        "minLow": -math.inf,
        "minHigh": math.inf,
        "maxName": None,
        "maxLow": -math.inf,
        "maxHigh": math.inf,
        "avgName": None,
        "avgLow": -math.inf,
        "avgHigh": math.inf,
        "sumName": None,
        "sumLow": -math.inf,
        "sumHigh": math.inf,
        "countLow": -math.inf,
        "countHigh": math.inf,
    }

    for param in parameters_required:
        if param in parameters:
            parameters_required[param] = parameters[param]

    for key, value in parameters_required.items():
        if isinstance(value, (int, float)):
            parameters_required[key] = jpype.JDouble(value)
    print(parameters_required)

    max_p, labels = maxp(df, w, parameters_required["disname"], 
                         parameters_required["sumName"],
                         parameters_required["sumLow"], parameters_required["sumHigh"],
                         parameters_required["minName"],
                         parameters_required["minLow"], parameters_required["minHigh"],
                         parameters_required["maxName"],
                         parameters_required["maxLow"], parameters_required["maxHigh"],
                         parameters_required["avgName"],
                         parameters_required["avgLow"], parameters_required["avgHigh"],
                         parameters_required["countLow"], parameters_required["countHigh"])

    print("Maxp function result: ", max_p, labels)
    if isinstance(labels, np.ndarray):
        labels = labels.tolist()
    
    empResult = {"max_p": max_p, "labels": labels}
    jsonEmpRes = json.dumps(empResult)
    return jsonEmpRes


# End point for backend generalizedP function
@app.post("/api/endpoint/generalizedP")
def gpEndPoint(parameters: Dict[str, Union[int, float, str]], filename: str):

    df = read_shapefile(data_dir, filename)
    w = rook(df)
    parameters_required = {
        "sim_attr": "",
        "ext_attr": "",
        "threshold": 2,
        "p": 5 #confirm and change
    }

    for param in parameters_required:
        if param in parameters:
            parameters_required[param] = parameters[param]

    print(parameters_required)
    prucLabels = generalized_p(df, w, parameters_required["sim_attr"], parameters_required["ext_attr"], parameters_required["threshold"], parameters_required["p"])
    print("generalized_p result: ", prucLabels)
    prucResult = {"heterogenity_score:": prucLabels[0], "labels": prucLabels[1]}
    jsonPrucResult = json.dumps(prucResult)

    return jsonPrucResult
# print(pruc(gdf, w, 'PCGDP1940', 'PERIMETER', 3000000, 10))


## OverLapping end points

# Endpoint to retrieve files for frontend dropdown menu
@app.get("/listFiles")
async def list_files():
    files = []
    for filename in os.listdir(data_dir):
        if filename.endswith(".shp"):
            files.append(filename)
    return files


# Endpoint for weights dropdown menu
@app.get("/listWeights")
async def list_weights():
    weights = ['Queen', 'Rook']
    return weights 


# Endpoint for uploading a file and storing it in data directory
@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    file_name = file.filename
    file_path = os.path.join(data_dir, file_name)

    with open(file_path, "wb") as f:
        contents = await file.read()
        f.write(contents)

    return {"Successfully uploaded : ", file_name}


# Endpoint to process and send only the geometry for frontend visualization
@app.get("/files/{filename}")
async def read_file_fe(filename: str):
    gdf = read_shapefile(data_dir, filename)
    gdf = gdf[['geometry']]
    gdf['id'] = range(1, len(gdf) + 1)
    # print(gdf)
    return json.loads(gdf.to_json())


# Pyneapple Backend

# Extract valid integer columns and ranges for sliders
@app.get("/dfDetails")
async def df_details(filename):

    df = read_shapefile(data_dir, filename)
    numeric_cols = df.select_dtypes(include=['number']).columns
    available_cols = [(col, df[col].min().item(), df[col].max().item()) for col in numeric_cols]
    print("Available_cols: ", available_cols)
    return available_cols


# Backend expressive maxP endpoint
@app.get("/api/endpoint/emp")
def empEndPoint(file_name: str, weight: str, disname: str,
                minName: str, minLow: float, minHigh: float,
                maxName: str, maxLow: float, maxHigh: float,
                avgName: str, avgLow: float, avgHigh: float,
                sumName: str, sumLow: float, sumHigh: float,
                countLow: float, countHigh: float):

    df = read_shapefile(data_dir, file_name)
    if weight == 'Rook':
        w = Rook.from_dataframe(df)
    elif weight == 'Queen':
        w = Queen.from_dataframe(df)
    else:
        print("Invalid weight selected")

    empStartTime = time.time()
    max_p, labels = expressive_maxp(df, w, disname, minName, minLow, minHigh,
                                    maxName, maxLow, maxHigh, avgName, avgLow, avgHigh,
                                    sumName, sumLow, sumHigh, countLow, countHigh)
    empEndTime = time.time()
    empExecTime = empEndTime - empStartTime
    labels = labels.tolist()
    empResult = {"execution_time": empExecTime, "max_p": max_p, "labels": labels}

    return empResult


# Backend generalizedP endpoint
@app.get("/api/endpoint/generalizedP")
def gmpEndPoint(file_name: str, weight: str, sim_attr: str, ext_attr: str,
                threshold: float, p: int):

    df = read_shapefile(data_dir, file_name)
    if weight == 'Rook':
        w = Rook.from_dataframe(df)
    elif weight == 'Queen':
        w = Queen.from_dataframe(df)
    else:
        print("Invalid weight selected")
    prucStartTime = time.time()
    prucLabels = generalized_p(df, w, sim_attr, ext_attr, threshold, p)
    prucEndTime = time.time()
    prucExecTime = prucEndTime - prucStartTime
    prucResult = {"execution_time": prucExecTime, "labels": prucLabels}

    return prucResult


# Backend library maxP endpoint
@app.get("/api/endpoint/libraryMaxP")
def libraryMaxP(file_name: str, weight: str, attr_name: str, threshold_name: str, threshold: float):

    df = read_shapefile(data_dir, file_name)
    if weight == 'Rook':
        w = Rook.from_dataframe(df)
    elif weight == 'Queen':
        w = Queen.from_dataframe(df)
    else:
        print("Invalid weight selected")
    lmpStartTime = time.time()
    lmpLabels = libMaxP(df, w, attr_name, threshold_name, threshold, 2)
    lmpEndTime = time.time()
    lmpExecTime = lmpEndTime - lmpStartTime
    lmpResult = {"execution_time": lmpExecTime, "labels": lmpLabels}

    return lmpResult


# backend scalable maxP endpoint
@app.get("/api/endpoint/ScalableMaxP")
def smp(file_name: str, weight: str, sim_attr: str, ext_attr: str, threshold: float):

    df = read_shapefile(data_dir, file_name)
    # w = Rook.from_dataframe(df)
    if weight == 'Rook':
        w = Rook.from_dataframe(df)
    elif weight == 'Queen':
        w = Queen.from_dataframe(df)
    else:
        print("Invalid weight selected")
    smpStartTime = time.time()
    smpLabels = scalable_maxp(df, w, sim_attr, ext_attr, threshold)
    smpEndTime = time.time()
    smpExecTime = smpEndTime - smpStartTime
    smpResult = {"execution_time": smpExecTime, "labels": smpLabels}

    return smpResult


# Endpooint for comparing scalable and library maxP
@app.get("/api/endpoint/compareMaxP")
def compareMaxP(file_name: str, weight: str, sim_attr: str, ext_attr: str,
                threshold: float):
    
    lmpResult = libraryMaxP(file_name, weight, sim_attr, ext_attr, threshold)
    lmpTime = lmpResult["execution_time"]
    smpResult = smp(file_name, weight, sim_attr, ext_attr, threshold)
    smpTime = smpResult["execution_time"]
    speedup = lmpTime/smpTime

    comparisionResult = {"ScalableMaxP_ExecutionTime": smpTime,
                         "LibraryMaxP_ExecutionTime": lmpTime,
                         "Total_SpeedUp(Percentage)": speedup*100,
                         "ScalableMaxP_Labels": smpResult["labels"],
                         "LibraryMaxP_Labels": lmpResult["labels"]}
    return comparisionResult


# defining the port on which the api application starts
if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=8000)
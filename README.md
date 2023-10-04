# Pyneapple demo

## Requirements

### Python
- [`JPype`](https://jpype.readthedocs.io/en/latest/)
- [`numpy`](https://numpy.org/devdocs/)
- [`geopandas`](https://geopandas.org/en/stable/)
- [`pandas`](https://pandas.pydata.org/)
- [`libpysal`](https://github.com/pysal/libpysal)
- [`matplotlib`](https://matplotlib.org/)
- [`spopt`](https://pysal.org/spopt/)
- [`poetry`](https://pypi.org/project/poetry/)

### Backend
- [`openai`](https://pypi.org/project/openai/)
- [`fastapi`](https://pypi.org/project/fastapi/)
- [`uvicorn`](https://pypi.org/project/uvicorn/)
- [python-dotenv](https://pypi.org/project/python-dotenv/)

### Frontend
- [`react`](https://www.npmjs.com/package/react)
- [`react-leaflet`](https://www.npmjs.com/package/react-leaflet)
- [`shapefile`](https://www.npmjs.com/package/react-leaflet-shapefile)
- [`react-speech-recognition`](https://www.npmjs.com/package/react-speech-recognition)

# Pyneapple backend
Developed by Siddhant

## Installation

### Dependency Management
We are utilizing the power of poetry, a dependency management toolkit for python. It is a powerful toolkit which eliminates dependency management and versioning errors for python projects. Inorder to avoid installing each dependency one at a time, poetry allows user to install all the required python dependencies with version control. To get started use the following commands:

```
$ pip install poetry
```
Once poetry is installed, navigate to the root directory of this project. Note that the project file already consist of the pyproject.toml file which indicates all the required dependencies and their version constraints. Next go to localhost directory and,

```
$ poetry install
```
Initially the above command will create a virtual environment and install all the mentioned python and backend dependencies within the virtual environment. Once installed, to load into the virtual environment use command

```
$ poetry shell
```

### Hosting the backend server

Once all the required python and backend dependencies exist, we can navigate to the folder localhost within the project, and use the following command to host our backend server

```
$ uvicorn main:app --reload
```

To verify that the backend server is up and running with necessary endpoints, uding any browser load https://localhost:8000/docs which should be a swagger page and documentation about the expected input and outputs for each backend end point

# `GPT-Pyneapple`
Developed by Siddhant

**GPT-Pyneapple** is a custom UI which aims to integrate the chat GPT's LLM with Pyneapple which is an open-source Python library for scalable and enriched spatial data analysis. GPT-Pyneapple uses chat GPT's superior language processing capabilities to process natural language audio and textual user queries into interpretable function calls for the Pyneapple library. This novel approach shows promising results and will keep improving with the underlying model.

### Starting the frontend

Install the required frontend dependencies by first navigating to the frontend folder, and go to "frontend/gpt_frontend" install the required frontend dependencies using

```
$ npm install
```

Next inorder to start the frontend web application, use the command

```
$ npm start
```

This should load up a web application at https://localhost:3000.

The frontend should have the necessary elements to select and load a map for a selected file as well as querying elements which allow both text as well as audio querying. Note that currently, the react speech recognition library only fully supports chrome browsers, therefore it is recommended to make full use of the application, use chrome/ chromium based browsers. 

### Pyneapple Frontend
Made with ❤️ by Akash Bilgi

This repository contains the frontend code for the Pyneapple App, a demo application showcasing various algorithms and visualizations.

<div style="text-align:center;">
  <img src="https://github.com/akashbilgi/Pyneapple/assets/44390281/6244cd17-7ba9-46ae-a419-248ddd39f673.gif" alt="Pyneapple App Demo" width="100%">
</div>


## Table of Contents

- [Table of Contents](#table-of-contents)
  - [Introduction](#introduction)
  - [Features](#features)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
  - [Usage](#usage)
  - [Contributing](#contributing)
  - [License](#license)

### Introduction

The Pyneapple App is designed to demonstrate different algorithms and visualizations. The frontend provides an interactive user interface to interact with the algorithms and view visualizations.

### Features

- Select input files and algorithms
- Adjust algorithm parameters through dropdowns, sliders, and inputs
- View visualizations of data and results

### Getting Started

#### Prerequisites

- Node.js (https://nodejs.org/)
- Git (https://git-scm.com/)

#### Installation

1. Clone the repository:


2. Navigate to the frontend directory:

   ```bash
   cd Pyneapple/frontend/query_frontend
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

### Usage

1. Start the development server:

   ```bash
   npm start
   ```

   This will launch the app in your browser at `http://localhost:3000`.

2. Use the app to select files, algorithms, adjust parameters, and view visualizations.

### Contributing

Contributions to this project are welcome. Feel free to submit issues and pull requests.

1. Fork the repository.
2. Create a new branch for your feature/bug fix: `git checkout -b feature/your-feature-name`.
3. Commit your changes: `git commit -m "Add some feature"`.
4. Push to the branch: `git push origin feature/your-feature-name`.
5. Create a pull request.

### License

This project is licensed under the [MIT License](LICENSE).


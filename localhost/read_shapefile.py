import geopandas as gpd
import os
# import libpysal

os.environ["SHAPE_RESTORE_SHX"] = "YES"

# filename = "LACity.shp"
# data_dir = "D:/user_pa1n/VSCode/projects/Pyneapple/testData"


def read_shapefile(data_dir,  filename):
    file_path = os.path.join(data_dir, filename)
    gdf = gpd.read_file(file_path)
    return gdf

# pth = libpysal.examples.get_path("mexicojoin.shp")
# mexico = gpd.read_file(pth)

# print(mexico.head())


# df = read_shapefile(data_dir, filename)
# data = df.iloc[0]
# print(df['ALAND10'][101])
# for column, value in data.items():
#     print(f"The type of the first entry in column '{column}' is {type(value)}")
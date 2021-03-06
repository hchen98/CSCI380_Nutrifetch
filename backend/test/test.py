# test file for nutri output
# do not use this script in the final production env

#Upc read
import urllib, json
from urllib.request import urlopen

upc = '044000032029'
# upc = '044000000615'
# upc = '688267000263'

from datetime import date

#Dictionary for daily values, current numbers as place holders, not actual values
dailyVal = {
    'fat': 78,
    'saturated-fat': 20,
    'cholesterol': 300,
    'sodium': 2300,
    'carbohydrates': 275,
    'fiber': 28,
    'vitamin-d': 20,
    'calcium': 1300,
    'iron': 18,
    'potassium': 4700,
}


#Checks if the upc exists or not
#input : upc code
#output : boolean
def upcCheck(upc):
    url = "https://world.openfoodfacts.org/api/v0/produc/" + upc + ".json"
    with urlopen(url) as urla:
        s = urla.read()
    check = json.loads(s)
    if check['status'] == 0:
        return False
    if check['status'] == 1:
        return True


#Takes the upc code and returns array of information
#Input UPC code
#Output returns list with each index as:
# 0 : product name (as a string)
# 1 : ingredients (as a string)
# 2 : allergens (as a string)
# 3 : calories (as a string)
#
# Nutrient values as arrays below[Nutrient name,
#                                 nutrient value with unit(if product contains it, emptry string if not),
#                                 nutrient daily value percent(if nutrient exists and  has daily value, empty string if not)]
# 4 : 'fat'
# 5 : 'staturated-fat'
# 6 : 'trans-fat'
# 7 : 'cholesterol'
# 8 : 'sodium'
# 9 : 'carbohydrates'
# 10 : 'fiber'
# 11 : 'sugars'
# 12 : 'protiens'
# 13 : 'vitamin-d'
# 14 : 'calcium'
# 15 : 'iron'
# 16 : 'potassium'
def upcNutrition(upc):
    #Loads the api json file
    url = "https://world.openfoodfacts.org/api/v0/produc/" + upc + ".json"
    with urlopen(url) as urla:
        s = urla.read()
    productFile = json.loads(s)

    #Array that contains the returned product information
    productInformation = []

    #Dictionary ref for general information
    genProductDict = productFile['product']

    #Name, ingredients, allergends
    productInformation.append(genProductDict['product_name'])
    productInformation.append(genProductDict['ingredients_text'])
    productInformation.append(genProductDict['allergens_from_ingredients'])

    #Dictionary ref for nutrition info of product
    nutriRef = genProductDict['nutriments']

    #Calories
    productInformation.append(nutriRef['energy-kcal_serving'])

    #Current nutrients list
    nutritionFields = [
        'fat',
        'staturated-fat',
        'trans-fat',
        'cholesterol',
        'sodium',
        'carbohydrates',
        'fiber',
        'sugars',
        'protiens',
        'vitamin-d',
        'calcium',
        'iron',
        'potassium',
    ]

    #Nutrients without daily values
    noDaily = ['protiens', 'sugars', 'trans-fat']

    #Loops through nutrient list, appends a list of nutrient : ['Name', 'Val', 'Percent']
    #If nutrient doesn't exist, still will append Name with emptry string for Val and Percent
    for i in range(len(nutritionFields)):
        field = nutritionFields[i]
        fieldStats = []
        fieldStats.append(field)
        endStr = '_serving'

        #Check if there's a per serving
        if field + endStr not in nutriRef:
            endStr = ''

        #Check if field exists in json
        if field in nutriRef:
            num = nutriRef[field + endStr]
            unit = nutriRef[field + '_unit']

            #Modify to represent in terms of mg
            if unit == 'mg':
                num *= 1000
            value = str(round(num, 2)) + str(unit)
            fieldStats.append(value)

            #Check for daily value
            if field in noDaily:
                percent = ''
            else:
                percent = round(((float(num) / dailyVal[field]) * 100), 2)
                percent = str(percent) + '%'
            fieldStats.append(percent)
            productInformation.append(fieldStats)

        else:
            fieldStats.append('')
            fieldStats.append('')
            productInformation.append(fieldStats)

    return productInformation


#Test of upcNutrition, should return string of information
# print(upcNutrition(upc))

# test output
for item in upcNutrition(upc):
    print("%s \n==" % item)
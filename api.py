import sqlite3
from geopy import distance
from scipy import spatial

c = sqlite3.connect("POI.sqlite")

res = c.execute("select * from supermarkets")
supermarkets = res.fetchall()
tree_supermarkets = spatial.KDTree([s[1:] for s in supermarkets])
res = c.execute("select * from amazon")
amazons = res.fetchall()
tree_amazons = spatial.KDTree([s[1:] for s in amazons])

def find_closest_supermarket(lat, lon):
    a_dist, a_nn = tree_supermarkets.query([(lat, lon)])
    return supermarkets[a_nn[0]]

def find_closest_amazon(lat, lon):
    a_dist, a_nn = tree_amazons.query([(lat, lon)])
    return amazons[a_nn[0]]

def compute(lat, lon, working_cost_super=80, working_cost_amazon=37, cost_per_km_super=150, cost_per_km_amazon=200, distance_between_clients=0.05, number_of_clients=1, kg_per_client=1):
    supermarket = find_closest_supermarket(lat, lon)
    amazon = find_closest_amazon(lat, lon)
    
    distance_to_supermarket = distance.distance((lat, lon), supermarket[1:]).km
    distance_to_amazon = distance.distance((lat, lon), amazon[1:]).km

    gCO2_super = working_cost_super * number_of_clients * kg_per_client + cost_per_km_super * distance_to_supermarket * number_of_clients
    gCO2_amazon = working_cost_amazon * number_of_clients * kg_per_client + (cost_per_km_amazon * (distance_to_amazon + distance_between_clients * number_of_clients))

    print(supermarket, amazon, "distance_to_supermarket", distance_to_supermarket, "distance_to_amazon", distance_to_amazon, "gCO2_super", gCO2_super, "gCO2_amazon", gCO2_amazon)

for i in range(0,40):
    compute(48.8937392,2.3489569, number_of_clients=i)
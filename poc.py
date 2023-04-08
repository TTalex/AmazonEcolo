import sqlite3
from geopy import distance
from scipy import spatial
import matplotlib.pyplot as plt

c = sqlite3.connect("POI.sqlite")

working_cost_super = 80
working_cost_amazon = 37
cost_per_km_super = 150
cost_per_km_amazon = 200
distance_between_clients = 0.05
number_of_clients = 10
kg_per_client = 15

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

def compute_for_coords(lat, lon, supermarket, amazon):
    #supermarket = find_closest_supermarket(lat, lon)
    #amazon = find_closest_amazon(lat, lon)
    #print(supermarket)
    #print(amazon)
    distance_to_supermarket = distance.distance((lat, lon), supermarket[1:]).km
    distance_to_amazon = distance.distance((lat, lon), amazon[1:]).km
    #print("distance_to_supermarket", distance_to_supermarket, "distance_to_amazon", distance_to_amazon)
    gCO2_super = working_cost_super * number_of_clients * kg_per_client + cost_per_km_super * distance_to_supermarket * number_of_clients
    gCO2_amazon = working_cost_amazon * number_of_clients * kg_per_client + (cost_per_km_amazon * (distance_to_amazon + distance_between_clients * number_of_clients))
    #print("gCO2_super", gCO2_super, "gCO2_amazon", gCO2_amazon)
    # if gCO2_amazon <= gCO2_super:
    #    print(supermarket, amazon, "distance_to_supermarket", distance_to_supermarket, "distance_to_amazon", distance_to_amazon, "gCO2_super", gCO2_super, "gCO2_amazon", gCO2_amazon)
    return gCO2_amazon > gCO2_super

# compute_for_coords(48.893864, 2.349710)
topleft = (510, -54)
bottomright = (412, 97)
coords = []
for i in range(topleft[0], bottomright[0], -1):
    for j in range(topleft[1], bottomright[1]):
        coords.append((i/10, j/10))

_, s_nn = tree_supermarkets.query(coords)
_, a_nn = tree_amazons.query(coords)

bitmap = []
for i in range(0, 98):
    bitmap.append([])
    for j in range(0, 151):
        if compute_for_coords(coords[151*i+j][0], coords[151*i+j][1], supermarkets[s_nn[151*i+j]], amazons[a_nn[151*i+j]]):
            bitmap[i].append([255,255,255])
        else:
            bitmap[i].append([0,0,0])

plt.imshow(bitmap, interpolation='nearest')
plt.savefig("15kg" + str(number_of_clients) + ".jpg")
from flask import Flask, request
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

def resolve_geo(lat, lon):
    supermarket = find_closest_supermarket(lat, lon)
    amazon = find_closest_amazon(lat, lon)
    distance_to_supermarket = distance.distance((lat, lon), supermarket[1:]).km
    distance_to_amazon = distance.distance((lat, lon), amazon[1:]).km
    if not supermarket[0]:
        supermarket = ('Nom indisponible', supermarket[1], supermarket[2])
    return {
        "supermarket": supermarket, 
        "amazon": amazon, 
        "distance_to_amazon": distance_to_amazon,
        "distance_to_supermarket":distance_to_supermarket
    }

app = Flask(__name__)

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/api')
def api():
    return resolve_geo(float(request.args.get("lat")), float(request.args.get("lon")))

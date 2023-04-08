# Amazon est écolo ?!

Un calculateur et une analyse des conditions requises pour que la livraison soit moins émettrice de gaz à effet de serre que le déplacement en supermarché.

## Install

Runs with python3 and flask + requests, frontend uses react & bulma css (both loaded with CDNs)

```
pip3 install flask
pip3 install requests
pip3 install geopy
pip3 install scipy
```

Start a server with `FLASK_APP=main.py python3 -m flask run`

Start the maps generation with `python3 poc.py`

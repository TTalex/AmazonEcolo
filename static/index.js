const App = () => {
    const [data, setData] = React.useState({
        amazon: [], 
        distance_to_amazon: 0, 
        distance_to_supermarket: 0,
        supermarket: []
    })
    const [params, setParams] = React.useState({
        working_cost_super: 20,
        working_cost_amazon: 5,
        cost_per_km_super: 150,
        cost_per_km_amazon: 200,
        distance_between_clients: 0.05,
        number_of_clients: 10,
        kg_per_client: 1
    })
    const [results, setResults] = React.useState({
        gCO2_super_working_cost: 0,
        gCO2_super_transport_cost: 0,
        gCO2_super_total: 0,
        gCO2_amazon_working_cost: 0,
        gCO2_amazon_transport_cost: 0,
        gCO2_amazon_total: 0
    })
    React.useEffect( () => {
        var map = L.map('map').setView([47.94, 1.83], 5);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);
        let markerClick;
        let markerSuper;
        let markerAmazon;
        map.on('click', async (e) => {
            if (!markerClick) {
                markerClick = L.marker(e.latlng)
                markerClick.addTo(map);
            }
            markerClick.setLatLng(e.latlng);
            let res = await fetchGeo(e.latlng.lat, e.latlng.lng)
            if (!markerSuper) {
                markerSuper = L.marker([res.supermarket[1], res.supermarket[2]], {icon: L.divIcon({ html: "🛒", className: "icon" })})
                markerSuper.addTo(map);
            }
            markerSuper.setLatLng([res.supermarket[1], res.supermarket[2]]);
            markerSuper.bindTooltip(res.supermarket[0])
            if (!markerAmazon) {
                markerAmazon = L.marker([res.amazon[1], res.amazon[2]], {icon: L.divIcon({ html: "🚚", className: "icon" })})
                markerAmazon.addTo(map);
            }
            markerAmazon.setLatLng([res.amazon[1], res.amazon[2]]);
            markerAmazon.bindTooltip(res.amazon[0])
        });
        
    }, [])
    React.useEffect(() => {compute()}, [data, params])
    const fetchGeo = async (lat, lon) => {
        const q = await fetch(window.location.origin + "/api?lat=" + lat + "&lon=" + lon)
        const res = await q.json()
        console.log(res)
        setData(res)
        return res
    }
    const compute = () => {
        const gCO2_super_working_cost = params.working_cost_super * params.number_of_clients * params.kg_per_client
        const gCO2_super_transport_cost = params.cost_per_km_super * data.distance_to_supermarket * params.number_of_clients
        const gCO2_super_total = gCO2_super_working_cost + gCO2_super_transport_cost
        const gCO2_amazon_working_cost = params.working_cost_amazon * params.number_of_clients * params.kg_per_client
        const gCO2_amazon_transport_cost = (params.cost_per_km_amazon * (data.distance_to_amazon + params.distance_between_clients * params.number_of_clients))
        const gCO2_amazon_total = gCO2_amazon_working_cost + gCO2_amazon_transport_cost
        setResults({
            gCO2_super_working_cost: gCO2_super_working_cost,
            gCO2_super_transport_cost: gCO2_super_transport_cost,
            gCO2_super_total: gCO2_super_total,
            gCO2_amazon_working_cost: gCO2_amazon_working_cost,
            gCO2_amazon_transport_cost: gCO2_amazon_transport_cost,
            gCO2_amazon_total: gCO2_amazon_total
        })
    }
    const updateParams = ({value, name}) => {
        setParams((oldParams) => {
            return {
                ...oldParams,
                [name]: value
            }
        })
    }
    const MapCard = ({nbClients}) => <div class="card">
            <div class="card-image">
                <figure class="image">
                    <img src={"/static/graphs/" + nbClients +"_clients.jpg"} alt={"Carte " + nbClients + " acheteurs"}/>
                </figure>
            </div>
            <div class="card-content">
                <div class="content" style={{textAlign: "center"}}>
                    {nbClients} acheteur(s)
                </div>
            </div>
        </div>
    return (
        <div className="main">
            <section className="section">
                <div className="container">
                    <h1 className="title">
                        Amazon est écolo ?!
                    </h1>
                    <p>Commencez par cliquer sur la carte pour initier le calcul.</p>
                    <div className="columns">
                        <div className="column">
                            <div id="map"></div>
                        </div>
                        <div className="column">
                        <div>
                            Nombre d'acheteurs ({params.number_of_clients})<br/>
                            <input type="range" name="number_of_clients" min="1" max="40" onChange={(e) => updateParams(e.target)} value={params["number_of_clients"]}/>
                        </div>
                        <div>
                            Poids du panier moyen en kg ({params.kg_per_client})<br/>
                            <input type="range" name="kg_per_client" min="0.1" max="50" step="0.1" onChange={(e) => updateParams(e.target)} value={params["kg_per_client"]}/>
                        </div>
                        <div>
                            Coût de fonctionnement supermarché par kg (gCO2) ({params.working_cost_super})<br/>
                            <input type="range" name="working_cost_super" min="7" max="39" onChange={(e) => updateParams(e.target)} value={params["working_cost_super"]}/>
                        </div>
                        <div>
                            Coût de fonctionnement e-commerce par kg (gCO2) ({params.working_cost_amazon})<br/>
                            <input type="range" name="working_cost_amazon" min="1" max="20" onChange={(e) => updateParams(e.target)} value={params["working_cost_amazon"]}/>
                        </div>
                        <div>
                            Émissions par km livraison (gCO2) ({params.cost_per_km_amazon})<br/>
                            <input type="range" name="cost_per_km_amazon" min="0" max="500" step="10" onChange={(e) => updateParams(e.target)} value={params["cost_per_km_amazon"]}/>
                        </div>
                        <div>
                            Émissions par km particulier (gCO2) ({params.cost_per_km_super})<br/>
                            <input type="range" name="cost_per_km_super" min="0" max="500" step="10" onChange={(e) => updateParams(e.target)} value={params["cost_per_km_super"]}/>
                        </div>
                        <div>
                            Distance entre acheteurs (km) ({params.distance_between_clients})<br/>
                            <input type="range" name="distance_between_clients" min="0" max="2" step="0.01" onChange={(e) => updateParams(e.target)} value={params["distance_between_clients"]}/>
                        </div>
                        </div>
                    </div>
                    {data.distance_to_supermarket > 0 && <div>
                        <div className="content">
                            {results.gCO2_amazon_total < results.gCO2_super_total 
                            ? <h3 className="subtitle">Avec ces critères, se faire livrer est plus écolo que de se déplacer !</h3> 
                            : <h3 className="subtitle">Avec ces critères, se déplacer est plus écolo que de se faire livrer !</h3>}
                        </div>
                        <table className="table is-bordered is-fullwidth">
                            <thead>
                                <tr>
                                    <td></td>
                                    <td><b>Supermarché</b></td>
                                    <td><b>Centre de livraison Amazon</b></td>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><b>Lieu le plus proche</b></td>
                                    <td>{data.supermarket[0]} ({data.distance_to_supermarket.toFixed(2)} km)</td>
                                    <td>{data.amazon[0]} ({data.distance_to_amazon.toFixed(2)} km)</td>
                                </tr>
                                <tr>
                                    <td><b>Émissions liées au coût de fonctionnement</b></td>
                                    <td>{results.gCO2_super_working_cost.toFixed(0)} gCO2</td>
                                    <td>{results.gCO2_amazon_working_cost.toFixed(0)} gCO2</td>
                                </tr>
                                <tr>
                                    <td><b>Émissions liées au transport</b></td>
                                    <td>{results.gCO2_super_transport_cost.toFixed(0)} gCO2</td>
                                    <td>{results.gCO2_amazon_transport_cost.toFixed(0)} gCO2</td>
                                </tr>
                                {results.gCO2_amazon_total < results.gCO2_super_total
                                ? <tr>
                                    <td><b>Émissions Totales</b></td>
                                    <td style={{backgroundColor: "hsl(48, 100%, 67%)"}}>{results.gCO2_super_total.toFixed(0)} gCO2</td>
                                    <td style={{backgroundColor: "hsl(141, 53%, 53%)"}}>{results.gCO2_amazon_total.toFixed(0)} gCO2</td>
                                </tr>
                                : <tr>
                                    <td><b>Émissions Totales</b></td>
                                    <td style={{backgroundColor: "hsl(141, 53%, 53%)"}}>{results.gCO2_super_total.toFixed(0)} gCO2</td>
                                    <td style={{backgroundColor: "hsl(48, 100%, 67%)"}}>{results.gCO2_amazon_total.toFixed(0)} gCO2</td>
                                </tr>
                                }
                            </tbody>
                        </table>

                    </div>}
                </div>
            </section>

            <section className="section">
                <div className="container">
                    <div className="content">
                        <h2 className="subtitle">
                            Méthode de calcul
                        </h2>
                        <p>
                            Ce calculateur utilise des hypothèses très simplifiées, un grand nombre de facteurs avec des précisions relatives peuvent être considérées pour un calcul plus complet.
                            Pour mieux comprendre comment ces estimations, <a href="https://blog.lafourche.fr/tout-savoir-sur-l-impact-carbone-de-la-livraison" target="_blank">des articles</a> de <a href="https://www.slate.fr/story/66127/le-e-commerce-bon-pour-environnement" target="_blank">vulgarisation</a> sont disponibles, ainsi que des études plus poussées en <a href="https://getmoreeducation.org/Content/Modules/Module1/1_Coley_Howard_and_Winter_Food_Miles.pdf" target="_blank">Angleterre</a> et en <a href="https://hal.science/hal-00546042/file/2005_dest_rizet_chaines_logistiques_et_consommation_energie_P.pdf" target="_blank">France</a>.
                        </p>
                        <p>
                            Les formules suivantes sont utilisées:
                        </p>
                        <ul>
                            <li>Supermarché = coût de fonctionnement par kg de produit (16 et 32 gco2/kg) + nombre d'acheteurs * coût distance moyenne d'un trajet (150gco2/km)</li>
                            <li>E-commerce = coût de fonctionnement par kg de produit (5 gco2/kg) + coût distance parcourue pour couvrir tous les acheteurs (70gco2/tonne-km pour les poids lourd, ou 200gco2/km pour les camionnettes) / nombre d'acheteurs</li>
                        </ul>
                        <p>
                            Les coûts de fonctionnement sont basés sur <a href="https://hal.science/hal-00546042/file/2005_dest_rizet_chaines_logistiques_et_consommation_energie_P.pdf" target="_blank">l'étude chaînes logistiques et consommation d’énergie: cas du yaourt et du jean</a>.
                        </p>
                        <div>
                            <img src="/static/graphs/emissiontable.png" alt="emissions Table"></img>
                        </div>
                        <p>Les coûts de fabrication et de transport vers les magasins et centres de distribution sont ignorés, car considérés comme similaire</p>
                        <p>Les positions des centres de livraisons sont extrait d'un article de <a href="https://www.ouest-france.fr/economie/entreprises/amazon/carte-amazon-ou-sont-situees-ses-bases-logistiques-en-france-f3d3766e-4ffb-11ed-9919-8fbf073b2344" target="_blank">ouest france</a> et les positions de supermarchés sont issues d'OpenStreetMap, via <a href="https://data.opendatasoft.com/explore/dataset/osm-shop-fr%40babel/table/?flg=fr&disjunctive.type&disjunctive.region&disjunctive.departement&disjunctive.commune&refine.type=supermarket&location=2,17.24539,0.06206&basemap=jawg.streets" target="_blank">opendatasoft</a>.</p>
                        <p>Enfin, il est important de noter que ce calcul est utopique. En réalité, l'achat en ligne ne remplace en général pas l'achat en magasin, mais est une consommation additionnelle.</p>
                    </div>
                </div>
            </section>

            <section className="section">
                <div className="container">
                    <div className="content">
                        <h2 className="subtitle">
                            Généralisation
                        </h2>
                        <p>
                            Le calculateur ci-dessus permet d'ajuster les paramètres pour une adresse précise.
                            Avec des paramètres fixes, il est possible de générer une carte sur l'ensemble de la France.
                        </p>
                        <table className="table is-bordered is-fullwidth">
                            <tr>
                                <td><b>Paramètre</b></td>
                                <td>Poids du panier moyen</td>
                                <td>Coût de fonctionnement supermarché par kg</td>
                                <td>Coût de fonctionnement amazon par kg</td>
                                <td>Émissions par km livraison</td>
                                <td>Émissions par km particulier</td>
                                <td>Distance entre acheteurs </td>
                            </tr>
                            <tr>
                                <td><b>Valeur fixée</b></td>
                                <td>1kg</td>
                                <td>20 gCO2</td>
                                <td>5 gCO2</td>
                                <td>200 gCO2/km</td>
                                <td>150 gCO2/km</td>
                                <td>0.05 km</td>
                            </tr>
                        </table>
                        <p>    
                            Les points blancs correspondent aux lieux où il est plus écolo de se déplacer vers le supermarché, les points noirs sont les lieux où commander sur internet est plus judicieux.
                        </p>
                        <div className="columns">
                            <div className="column"><MapCard nbClients={1} /></div>
                            <div className="column"><MapCard nbClients={3} /></div>
                            <div className="column"><MapCard nbClients={10} /></div>
                            <div className="column"><MapCard nbClients={20} /></div>
                            <div className="column"><MapCard nbClients={40} /></div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

const domContainer = document.getElementById('root');
ReactDOM.render(<App />, domContainer);
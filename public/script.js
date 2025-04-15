


var map, geojson, layer_name, layerSwitcher, featureOverlay, highlightStyle, modify, draw_add, snap_edit, url, overlays, persons, state_name, feature, myFeature, content1;
var del_fts = new Array();
var container = document.getElementById('popup');
var content = document.getElementById('popup-content');
var closer = document.getElementById('popup-closer');


/**
 * Create an overlay to anchor the popup to the map.
 */
var overlay = new ol.Overlay({
    element: container,
    autoPan: true,
    autoPanAnimation: {
        duration: 250
    }
});


/**
 * Add a click handler to hide the popup.
 * @return {boolean} Don't follow the href.
 */
closer.onclick = function () {
    overlay.setPosition(undefined);
    closer.blur();
    return false;
};



var view = new ol.View({
    projection: 'EPSG:4326',
    center: [-53.46992425154046, -22.080950190351942],
    zoom: 16,

});
var view_ov = new ol.View({
    projection: 'EPSG:4326',
    center: [-53.46992425154046, -22.080950190351942],
    zoom: 16,
});


var base_maps = new ol.layer.Group({
    'title': 'Base maps',
    layers: [
        new ol.layer.Tile({
            title: 'OSM',
            type: 'base',
            visible: true,
            source: new ol.source.OSM()
        }),

        new ol.layer.Tile({
            title: 'Satellite',
            type: 'base',
            visible: true,
            source: new ol.source.XYZ({
                attributions: ['Powered by Esri',
                    'Source: Esri, DigitalGlobe, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community'
                ],
                attributionsCollapsible: false,
                url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                maxZoom: 23
            })
        })
    ]
});

var OSM = new ol.layer.Tile({
    source: new ol.source.OSM(),
    type: 'base',
    title: 'OSM',
});

overlays = new ol.layer.Group({
    'title': 'Overlays',
    layers: [
        new ol.layer.Image({
            title: 'states',
            // extent: [-180, -90, -180, 90],
            source: new ol.source.ImageWMS({
                url: 'http://localhost:8080/geoserver/wms',
                params: {
                    'LAYERS': 'topp:states'
                },
                ratio: 1,
                serverType: 'geoserver'
            })
        }),

        new ol.layer.Image({
            title: 'area18',
            // extent: [-180, -90, -180, 90],
            source: new ol.source.ImageWMS({
                url: 'http://localhost:8080/geoserver/wms',
                params: {
                    'LAYERS': 'adUcation:area_18'
                },
                ratio: 1,
                serverType: 'geoserver'
            })
        })


    ]
});




map = new ol.Map({
    target: 'map',
    view: view,
    overlays: [overlay]
});

map.addLayer(base_maps);
map.addLayer(overlays);

/* var rainfall = new ol.layer.Image({
          title: 'population',
         // extent: [-180, -90, -180, 90],
          source: new ol.source.ImageWMS({
            url: 'http://localhost:8082/geoserver/wms',
            params: {'LAYERS': 'topp:population'},
            ratio: 1,
            serverType: 'geoserver'
          })
        });
    	
        overlays.getLayers().push(rainfall);*/
//map.addLayer(rainfall);

var mouse_position = new ol.control.MousePosition();
map.addControl(mouse_position);

var overview = new ol.control.OverviewMap({
    view: view_ov,
    collapseLabel: 'O',
    label: 'O',
    layers: [OSM]
});

map.addControl(overview);

var full_sc = new ol.control.FullScreen({
    label: 'F'
});
map.addControl(full_sc);

var zoom = new ol.control.Zoom({
    zoomInLabel: '+',
    zoomOutLabel: '-'
});
map.addControl(zoom);

var slider = new ol.control.ZoomSlider();
map.addControl(slider);


var zoom_ex = new ol.control.ZoomToExtent({
    extent: [
        -149.81, 13.70,
        -43.00, 63.00
    ]
});
map.addControl(zoom_ex);

var layerSwitcher = new ol.control.LayerSwitcher({
    activationMode: 'click',
    startActive: true,
    tipLabel: 'Layers', // Optional label for button
    groupSelectStyle: 'children', // Can be 'children' [default], 'group' or 'none'
    collapseTipLabel: 'Collapse layers',
});
map.addControl(layerSwitcher);

function legend() {

    $('#legend').empty();

    var no_layers = overlays.getLayers().get('length');

    var head = document.createElement("h4");

    var txt = document.createTextNode("Legend");

    head.appendChild(txt);
    var element = document.getElementById("legend");
    element.appendChild(head);
    var ar = [];
    var i;
    for (i = 0; i < no_layers; i++) {
        ar.push("http://localhost:8080/geoserver/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LAYER=" + overlays.getLayers().item(i).get('title'));
        //alert(overlays.getLayers().item(i).get('title'));
    }
    for (i = 0; i < no_layers; i++) {
        var head = document.createElement("p");

        var txt = document.createTextNode(overlays.getLayers().item(i).get('title'));
        //alert(txt[i]);
        head.appendChild(txt);
        var element = document.getElementById("legend");
        element.appendChild(head);
        var img = new Image();
        img.src = ar[i];

        var src = document.getElementById("legend");
        src.appendChild(img);

    }

}

legend();


url = "http://localhost:8080/geoserver/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=topp:states&outputFormat=application/json"
//url = "http://localhost:8080/geoserver/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=topp:states&outputFormat=application/json"


var style = new ol.style.Style({
    fill: new ol.style.Fill({
        color: 'rgba(255, 255, 255, 0.1)'
    }),
    stroke: new ol.style.Stroke({
        color: '#ffcc33',
        width: 3
    }),

    image: new ol.style.Circle({
        radius: 7,
        fill: new ol.style.Fill({
            color: '#ffcc33'
        })
    })
});


geojson = new ol.layer.Vector({
    title: 'WFS_layer',
    //title: '<h5>' + value_crop+' '+ value_param +' '+ value_seas+' '+value_level+'</h5>',
    source: new ol.source.Vector({
        url: url,
        format: new ol.format.GeoJSON()
    }),
    style: style,

});

geojson.getSource().on('addfeature', function () {
    //alert(geojson.getSource().getExtent());
    /* map.getView().fit(
         geojson.getSource().getExtent(),
         { duration: 1590, size: map.getSize() }
     );*/
});
overlays.getLayers().push(geojson);

//map.addLayer(geojson);

layerSwitcher.renderPanel();

highlightStyle = new ol.style.Style({
    fill: new ol.style.Fill({
        color: 'rgba(255,255,255,0.7)',
    }),
    stroke: new ol.style.Stroke({
        color: '#3399CC',
        width: 3,
    }),
    image: new ol.style.Circle({
        radius: 10,
        fill: new ol.style.Fill({
            color: '#3399CC'
        })
    })
});

featureOverlay = new ol.layer.Vector({
    title: 'high',
    source: new ol.source.Vector(),
    map: map,
    style: highlightStyle
});



layerSwitcher.renderPanel();

//map.on('click', highlight);


function toggle_editing() {

    var color = $('#toggle_editing').css("background-color");

    if (color == 'rgb(239, 239, 239)') {

        document.getElementById("get_info").style.backgroundColor = '';
        document.getElementById("toggle_editing").style.backgroundColor = 'coral';
        document.getElementById("select_feature").style.backgroundColor = '';
        document.getElementById("create_feature").style.backgroundColor = '';
        document.getElementById("modify_feature").style.backgroundColor = '';

        document.getElementById("select_feature").disabled = false;
        document.getElementById("create_feature").disabled = false;
        document.getElementById("modify_feature").disabled = false;
        document.getElementById("delete_feature").disabled = false;

        document.getElementById("get_info").disabled = true;
        map.un('singleclick', getinfo);
        overlay.setPosition(undefined);
        closer.blur();

    }

    else if (color == 'rgb(255, 127, 80)') {

        document.getElementById("toggle_editing").style.backgroundColor = '';
        document.getElementById("select_feature").style.backgroundColor = '';
        document.getElementById("create_feature").style.backgroundColor = '';
        document.getElementById("modify_feature").style.backgroundColor = '';

        document.getElementById("select_feature").disabled = true;
        document.getElementById("create_feature").disabled = true;
        document.getElementById("modify_feature").disabled = true;
        document.getElementById("delete_feature").disabled = true;

        document.getElementById("get_info").disabled = false;

        if (modify) {
            map.removeInteraction(modify);
        }
        if (draw_add) {
            map.removeInteraction(draw_add);
        }
        if (snap_edit) {
            map.removeInteraction(snap_edit);
        }

        map.un('click', highlight);
        map.un('click', highlight_mod_attributes);
        overlay.setPosition(undefined);
        closer.blur();

    }
}
document.getElementById("toggle_editing").onclick = toggle_editing;
document.getElementById("get_info").onclick = get_info;
document.getElementById("select_feature").onclick = select_feature;
document.getElementById("create_feature").onclick = create_feature;
document.getElementById("modify_feature").onclick = modify_feature;
document.getElementById("delete_feature").onclick = delete_feature;


function highlight(evt) {
    if (featureOverlay) {
        featureOverlay.getSource().clear();
        map.removeLayer(featureOverlay);
    }
    feature = map.forEachFeatureAtPixel(evt.pixel,
        function (feature, layer) {
            return feature;
        });

    if (feature) {

        var geometry = feature.getGeometry();
        var coord = geometry.getCoordinates();
        var coordinate = evt.coordinate;

        featureOverlay.getSource().addFeature(feature);
        //overlays.getLayers().push(featureOverlay);

        var content1 = '<h3>' + feature.get('Nome da área') + '</h3>';
        content1 += '<h5>' + feature.get('Tamanho') + '</h5>';

        //  alert(feature.getId());
        content.innerHTML = content1;
        overlay.setPosition(coordinate);



        layerSwitcher.renderPanel();

        //alert(feature.get('gid'));

        //  alert(feature.get('gid'));

        map.updateSize();
    }

    // grid1.getSelectionModel().selectRow(grid1.getStore().find("id", feature.getId())); 


}

function highlight_mod_attributes(evt) {
    if (featureOverlay) {
        featureOverlay.getSource().clear();
        map.removeLayer(featureOverlay);
    }
    //if (geojson) {geojson.getSource().refresh();}
    feature = map.forEachFeatureAtPixel(evt.pixel,
        function (feature, layer) {
            return feature;
        });

    if (feature) {

        var geometry = feature.getGeometry();
        var coord = geometry.getCoordinates();
        var coordinate = evt.coordinate;
        //alert(coordinate);
        featureOverlay.getSource().addFeature(feature);
        //overlays.getLayers().push(featureOverlay);


        content1 = '<label for="state_name">Nome da área:</label><input type="text" id="state_name" name="state_name" value=' + feature.get('STATE_NAME') + '><br><br>';
        content1 += '<label for="persons">Tamanho:</label><input type="text" id="persons" name="persons" value=' + feature.get('PERSONS') + '><br><br>';
        content1 += ' <button onclick="save_mod_features()" id = "save_mod_features">Salvar</button>';
        content1 += ' <button onclick="cancel_mod_features()" id = "cancel_mod_features">Cancelar</button>';


        //  alert(feature.getId());
        content.innerHTML = content1;
        overlay.setPosition(coordinate);



        //layerSwitcher.renderPanel();

        //alert(feature.get('gid'));

        //  alert(feature.get('gid'));

        map.updateSize();
    }

    // grid1.getSelectionModel().selectRow(grid1.getStore().find("id", feature.getId())); 


}


function select_feature() {
    document.getElementById("get_info").style.backgroundColor = '';
    map.un('singleclick', getinfo);
    overlay.setPosition(undefined);
    closer.blur();

    document.getElementById("select_feature").style.backgroundColor = 'coral';
    document.getElementById("create_feature").style.backgroundColor = '';
    document.getElementById("modify_feature").style.backgroundColor = '';

    if (draw_add) {
        map.removeInteraction(draw_add);
    }
    if (modify) {
        map.removeInteraction(modify);
    }
    if (snap_edit) {
        map.removeInteraction(snap_edit);
    }
    map.on('click', highlight);
}


function create_feature() {
    map.un('click', highlight_mod_attributes);
    map.un('click', highlight);
    document.getElementById("get_info").style.backgroundColor = '';
    map.un('singleclick', getinfo);
    overlay.setPosition(undefined);
    closer.blur();

    //map.on('click
    //alert('change');
    if (modify) {
        map.removeInteraction(modify);
    }
    if (snap_edit) {
        map.removeInteraction(snap_edit);
    }
    document.getElementById("create_feature").style.backgroundColor = 'coral';
    document.getElementById("modify_feature").style.backgroundColor = '';
    document.getElementById("select_feature").style.backgroundColor = '';


    source_mod = geojson.getSource();
    draw_add = new ol.interaction.Draw({
        source: source_mod,
        type: 'Polygon'
    });
    map.addInteraction(draw_add);
    //var source_g = geojson.getSource();
    snap_edit = new ol.interaction.Snap({
        source: source_mod
    });
    map.addInteraction(snap_edit);
    draw_add.on('drawend',
        function (e) {
            //pop = prompt("Enter Population", "");
            //state_name = prompt("Enter Name", "");
            //map.on('click', highlight_mod);
            myFeature = e.feature;
            if (myFeature) {

                var geometry = myFeature.getGeometry();
                var coord = geometry.getCoordinates();
                var extent = geometry.getExtent();
                var centroid = ol.extent.getCenter(extent);
                //alert(centroid);
                //var coordinate = e.coordinate;

                featureOverlay.getSource().addFeature(myFeature);
                //overlays.getLayers().push(featureOverlay);


                /*content1 = '<label for="state_name">Nome da área:</label><input type="text" id="state_name" name="state_name" value=' + myFeature.get('STATE_NAME') + '><br><br>';
                content1 += '<label for="persons">Tamanho:</label><input type="text" id="persons" name="persons" value=' + myFeature.get('PERSONS') + '><br><br>';
                content1 += ' <button onclick="save_created()" id = "save_created">Salvar</button>';
                content1 += ' <button onclick="cancel_created()" id = "cancel_created">Deletar</button>';
                */
                //  alert(feature.getId());
                if (!myFeature.getId()) {
                    // Atribua um ID único à feature, por exemplo, usando um contador ou alguma lógica específica
                    myFeature.setId('feature-' + Math.random().toString(36).substr(2, 9));
                }

                const featureId = myFeature.getId();
                console.log("ID da Feature:", featureId);

                content1 = '<label for="state_name">Nome da área:</label><input type="text" id="state_name" name="state_name" value="' + myFeature.get('STATE_NAME') + '"><br><br>';
                content1 += '<label for="persons">Tamanho:</label><input type="text" id="persons" name="persons" value="' + myFeature.get('PERSONS') + '"><br><br>';

                // Certifique-se de que myFeature.getId() está retornando um valor válido
                /*const featureId = myFeature.getId();
                console.log("ID da Feature:", featureId);  // Adiciona um log para inspecionar o ID
                */
                content1 += '<button onclick="save_created(this)" id="save_created" data-feature-id="' + featureId + '">Salvar</button>';
                content1 += '<button onclick="cancel_created()" id="cancel_created">Deletar</button>';


               
                
               

                content.innerHTML = content1;
                overlay.setPosition(centroid);



                //layerSwitcher.renderPanel();

                //alert(feature.get('gid'));

                //  alert(feature.get('gid'));

                //	map.updateSize();
            }
            // alert(state_name+''+pupulation);

            // alert('karan');
            //var features = geojson.getSource().getFeatures();
            //var length = features.length;
            // alert(length);
        }, this);

    geojson.getSource().on('addfeature', function () {
        var features = geojson.getSource().getFeatures();
        var length = features.length;
        // alert(length);
    });



}

// voltar depois que fazer o teste 
/*function save_created() {
    const state_name = document.getElementById("state_name").value;
    const persons = document.getElementById("persons").value;

    const coords = myFeature.getGeometry();
    const format = new ol.format.GML();
    const gml3 = format.writeGeometry(coords, {
        srsName: 'EPSG:4326' // ou outro CRS que você esteja utilizando
    });

    const url1 = 'http://localhost:3000/api/geoserver/wfs'; // URL do backend
    //var url1 = 'http://localhost:8080geoserver/wfs';
    const postData1 =
        `<wfs:Transaction service="WFS" version="1.1.0"
        xmlns:adUcation="http://www.openplans.org/adUcation"
        xmlns:ogc="http://www.opengis.net/ogc"
        xmlns:wfs="http://www.opengis.net/wfs"
        xmlns:gml="http://www.opengis.net/gml"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/WFS-transaction.xsd">
            <wfs:Insert>
                <adUcation:states>
                    <adUcation:the_geom>
                        ${gml3}
                    </adUcation:the_geom>
                    <adUcation:persons>${persons}</adUcation:persons>
                    <adUcation:state_name>${state_name}</adUcation:state_name>
                </adUcation:states>
            </wfs:Insert>
        </wfs:Transaction>`;

    console.log(postData1); // Imprime o XML gerado no console

    fetch(url1, {
        method: 'POST',
        headers: {
            'Content-Type': 'text/xml'
        },
        body: postData1
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('HTTP error ' + response.status);
        }
        return response.text();
    })
    .then(data => {
        alert('Feature saved successfully');
        geojson.getSource().refresh(); // Atualiza a fonte de dados do GeoJSON
        overlay.setPosition(undefined);
        closer.blur();
        featureOverlay.getSource().clear();
        
        // Adiciona o polígono diretamente ao mapa se a atualização da fonte não for imediata
        const parser = new ol.format.WFS();
        const features = parser.readFeatures(data, {
            dataProjection: 'EPSG:4326', // ou outro CRS que você esteja utilizando
            featureProjection: 'EPSG:3857' // ou outro CRS que você esteja utilizando
        });

        features.forEach(feature => {
            geojson.getSource().addFeature(feature); // Adiciona a feature ao GeoJSON source
        });
    })
    .catch(error => {
        alert('Error: ' + error.message);
    });
}*/

//function save_created() {
//function save_created(feature) {

/* state_name = document.getElementById("state_name").value;
 pop = document.getElementById("persons").value;

 //alert(state_name);
 var coords = myFeature.getGeometry();
 //	alert(coords.toString());
 var format = new ol.format.GML({
     //featureNS: 'http://www.census.gov',
     //  featurePrefix: 'tiger',
     // featureType: 'tiger:tiger_roads',
     // srsName: 'urn:ogc:def:crs:EPSG::4326'

 });
 /*var out = format.writeFeatures(mod_features[i], {
// dataProjection: 'EPSG:4326',
 //featureProjection: 'EPSG:4326'
});*/
//alert(out.getGeometry());
//var gml3 = format.writeGeometry(coords, {
//dataProjection: 'EPSG:4326',
//featureProjection: 'urn:ogc:def:crs:EPSG::4326'
//rightHanded: false
//  }

// );
/* var url1 = 'http://localhost:8080/geoserver/wfs';
 var method = 'POST';
 var postData1 =
     '<wfs:Transaction service="WFS" version="1.1.0"\n' +
     'xmlns:adUcation="http://www.openplans.org/adUcation"\n' +
     'xmlns:ogc="http://www.opengis.net/ogc"\n' +
     'xmlns:wfs="http://www.opengis.net/wfs"\n' +
     'xmlns:gml="http://www.opengis.net/gml"\n' +
     'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n' +
     'xsi:schemaLocation="http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/WFS-transaction.xsd">\n' +
     '<wfs:Insert>\n' +
     '<adUcation:population>\n' +
     '<adUcation:the_geom>\n' +
     gml3 + '\n' +
     '</adUcation:the_geom>\n' +
     '<adUcation:PERSONS>' + pop + '</adUcation:PERSONS>\n' +
     '<adUcation:STATE_NAME>' + state_name + '</adUcation:STATE_NAME>\n' +
     '</adUcation:population>\n' +
     '</wfs:Insert>\n' +
     '</wfs:Transaction>\n';
 //alert(postData1);
 var req1 = new XMLHttpRequest();
 req1.open("POST", 'http://localhost:8080/geoserver/wfs', false);
 req1.setRequestHeader('User-Agent', 'XMLHTTP/1.0');
 req1.setRequestHeader('Content-type', 'text/xml');
 req1.onreadystatechange = function() {
     if (req1.readyState != 4) return;
     if (req1.status != 200 && req1.status != 304) {
         alert('HTTP error ' + req1.status);
         return;
     }
     // req_res[i] = req.responseText;


     // alert(req1.responseText);

     //  Ext.MessageBox.alert('Status', 'changes saved successfully');
 }
 if (req1.readyState == 4) return;
 req1.send(postData1);
 //alert(req1.responseText);
 alert('Feature saved successfully');
 geojson.getSource().refresh();
 overlay.setPosition(undefined);
 closer.blur();
 featureOverlay.getSource().clear();






*/

// voltar depois dia 27/08/2024
/*function save_created(button) {

    const featureId = button.getAttribute('data-feature-id');
    console.log("Feature ID:", featureId);  // Adiciona um log para inspecionar o ID

    if (!featureId) {
        console.error("O ID da feature não foi definido.");
        return;
    }

    const feature = featureOverlay.getSource().getFeatureById(featureId);

    if (!feature) {
        console.error("A feature com o ID " + featureId + " não foi encontrada.");
        return;
    }

    console.log("Feature encontrada:", feature);



    
    const state_name = feature.get('STATE_NAME');
    const persons = feature.get('PERSONS');
    //voltar depois
    const gml3 = new ol.format.GML3().writeFeatureElement(feature);

    if (!feature.getGeometry()) {
        console.error("A feature não possui geometria.");
        return;
    }

    try {
        const gml3 = new ol.format.GML3().writeFeatureElement(feature);
        console.log("GML3 gerado com sucesso:", gml3);

        // Continue com o código para montar a transação WFS
        let postData1 = 
            '<wfs:Transaction service="WFS" version="1.1.0"\n' +
            'xmlns:adUcation="http://www.openplans.org/adUcation"\n' +
            'xmlns:ogc="http://www.opengis.net/ogc"\n' +
            'xmlns:wfs="http://www.opengis.net/wfs"\n' +
            'xmlns:gml="http://www.opengis.net/gml"\n' +
            'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n' +
            'xsi:schemaLocation="http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/WFS-transaction.xsd">\n';
        
        if (feature.getId()) {
            // Editar a feature existente
            postData1 += '<wfs:Update typeName="adUcation:persons">\n' +
                '<wfs:Property>\n' +
                '<wfs:Name>the_geom</wfs:Name>\n' +
                '<wfs:Value>' + gml3 + '</wfs:Value>\n' +
                '</wfs:Property>\n' +
                '<wfs:Property>\n' +
                '<wfs:Name>PERSONS</wfs:Name>\n' +
                '<wfs:Value>' + feature.get('PERSONS') + '</wfs:Value>\n' +
                '</wfs:Property>\n' +
                '<wfs:Property>\n' +
                '<wfs:Name>STATE_NAME</wfs:Name>\n' +
                '<wfs:Value>' + feature.get('STATE_NAME') + '</wfs:Value>\n' +
                '</wfs:Property>\n' +
                '<ogc:Filter>\n' +
                '<ogc:FeatureId fid="' + feature.getId() + '"/>\n' +
                '</ogc:Filter>\n' +
                '</wfs:Update>\n';
        } else {
            // Inserir uma nova feature
            postData1 += '<wfs:Insert>\n' +
                '<adUcation:population>\n' +
                '<adUcation:the_geom>\n' +
                gml3 + '\n' +
                '</adUcation:the_geom>\n' +
                '<adUcation:PERSONS>' + feature.get('PERSONS') + '</adUcation:PERSONS>\n' +
                '<adUcation:STATE_NAME>' + feature.get('STATE_NAME') + '</adUcation:STATE_NAME>\n' +
                '</adUcation:population>\n' +
                '</wfs:Insert>\n';
        }

        postData1 += '</wfs:Transaction>';

        // Enviar a transação WFS para o GeoServer
        var req1 = new XMLHttpRequest();
        req1.open("POST", 'http://localhost:8080/geoserver/wfs', false);
        req1.setRequestHeader('User-Agent', 'XMLHTTP/1.0');
        req1.setRequestHeader('Content-type', 'text/xml');
        req1.onreadystatechange = function() {
            if (req1.readyState != 4) return;
            if (req1.status != 200 && req1.status != 304) {
                alert('HTTP error ' + req1.status);
                return;
            }
            alert('Feature saved successfully');
            geojson.getSource().refresh();
            overlay.setPosition(undefined);
            closer.blur();
            featureOverlay.getSource().clear();
        }
        req1.send(postData1);
    } catch (error) {
        console.error("Erro ao gerar GML3:", error);
    }

    // Montar a transação WFS
   /* let postData1 =
        '<wfs:Transaction service="WFS" version="1.1.0"\n' +
        'xmlns:adUcation="http://www.openplans.org/adUcation"\n' +
        'xmlns:ogc="http://www.opengis.net/ogc"\n' +
        'xmlns:wfs="http://www.opengis.net/wfs"\n' +
        'xmlns:gml="http://www.opengis.net/gml"\n' +
        'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n' +
        'xsi:schemaLocation="http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/WFS-transaction.xsd">\n';

    // Verificar se a feature possui um ID (é uma feature existente)

    if (feature.getId()) {
        // Editar a feature existente
        postData1 += '<wfs:Update typeName="adUcation:persons">\n' +
            '<wfs:Property>\n' +
            '<wfs:Name>the_geom</wfs:Name>\n' +
            '<wfs:Value>' + gml3 + '</wfs:Value>\n' +
            '</wfs:Property>\n' +
            '<wfs:Property>\n' +
            '<wfs:Name>PERSONS</wfs:Name>\n' +
            '<wfs:Value>' + persons + '</wfs:Value>\n' +
            '</wfs:Property>\n' +
            '<wfs:Property>\n' +
            '<wfs:Name>STATE_NAME</wfs:Name>\n' +
            '<wfs:Value>' + state_name + '</wfs:Value>\n' +
            '</wfs:Property>\n' +
            '<ogc:Filter>\n' +
            '<ogc:FeatureId fid="' + feature.getId() + '"/>\n' +
            '</ogc:Filter>\n' +
            '</wfs:Update>\n';
    } else {
        // Inserir uma nova feature
        postData1 += '<wfs:Insert>\n' +
            '<adUcation:population>\n' +
            '<adUcation:the_geom>\n' +
            gml3 + '\n' +
            '</adUcation:the_geom>\n' +
            '<adUcation:PERSONS>' + persons + '</adUcation:PERSONS>\n' +
            '<adUcation:STATE_NAME>' + state_name + '</adUcation:STATE_NAME>\n' +
            '</adUcation:population>\n' +
            '</wfs:Insert>\n';
    }

    postData1 += '</wfs:Transaction>';

    // Enviar a transação WFS para o GeoServer
    var req1 = new XMLHttpRequest();
    req1.open("POST", 'http://localhost:8080/geoserver/wfs', false);
    req1.setRequestHeader('User-Agent', 'XMLHTTP/1.0');
    req1.setRequestHeader('Content-type', 'text/xml');
    req1.onreadystatechange = function () {
        if (req1.readyState != 4) return;
        if (req1.status != 200 && req1.status != 304) {
            alert('HTTP error ' + req1.status);
            return;
        }
        alert('Feature saved successfully');
        geojson.getSource().refresh();
        overlay.setPosition(undefined);
        closer.blur();
        featureOverlay.getSource().clear();
    }
    req1.send(postData1);

}*/

function save_created(button) {
    const featureId = button.getAttribute('data-feature-id');
    
    if (!featureId) {
        console.error("O ID da feature não foi definido.");
        return;
    }
    
    const feature = featureOverlay.getSource().getFeatureById(featureId);
    
    if (!feature) {
        console.error("A feature com o ID " + featureId + " não foi encontrada.");
        return;
    }

    console.log("Feature encontrada:", feature);

    const geometry = feature.getGeometry();
    if (!geometry) {
        console.error("A feature não possui uma geometria válida.");
        return;
    }

    try {
        const gml3 = new ol.format.GML3().writeFeatures([feature], {
            featureProjection: 'EPSG:4326',
            dataProjection: 'EPSG:4326'
        });

        console.log("GML3 gerado com sucesso:", gml3);

        let postData1 = 
            '<wfs:Transaction service="WFS" version="1.1.0"\n' +
            'xmlns:topp="http://www.openplans.org/topp"\n' +
            'xmlns:ogc="http://www.opengis.net/ogc"\n' +
            'xmlns:wfs="http://www.opengis.net/wfs"\n' +
            'xmlns:gml="http://www.opengis.net/gml"\n' +
            'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n' +
            'xsi:schemaLocation="http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/WFS-transaction.xsd">\n';
        
        if (feature.getId()) {
            postData1 += '<wfs:Update typeName="topp:persons">\n' +
                '<wfs:Property>\n' +
                '<wfs:Name>the_geom</wfs:Name>\n' +
                '<wfs:Value>' + gml3 + '</wfs:Value>\n' +
                '</wfs:Property>\n' +
                '<wfs:Property>\n' +
                '<wfs:Name>PERSONS</wfs:Name>\n' +
                '<wfs:Value>' + feature.get('PERSONS') + '</wfs:Value>\n' +
                '</wfs:Property>\n' +
                '<wfs:Property>\n' +
                '<wfs:Name>STATE_NAME</wfs:Name>\n' +
                '<wfs:Value>' + feature.get('STATE_NAME') + '</wfs:Value>\n' +
                '</wfs:Property>\n' +
                '<ogc:Filter>\n' +
                '<ogc:FeatureId fid="' + feature.getId() + '"/>\n' +
                '</ogc:Filter>\n' +
                '</wfs:Update>\n';
        } else {
            postData1 += '<wfs:Insert>\n' +
                '<topp:population>\n' +
                '<topp:the_geom>\n' +
                gml3 + '\n' +
                '</topp:the_geom>\n' +
                '<topp:PERSONS>' + feature.get('PERSONS') + '</topp:PERSONS>\n' +
                '<topp:STATE_NAME>' + feature.get('STATE_NAME') + '</topp:STATE_NAME>\n' +
                '</topp:population>\n' +
                '</wfs:Insert>\n';
        }

        postData1 += '</wfs:Transaction>';

        var req1 = new XMLHttpRequest();
        req1.open("POST", 'http://localhost:8080/geoserver/wfs', false);
        req1.setRequestHeader('User-Agent', 'XMLHTTP/1.0');
        req1.setRequestHeader('Content-type', 'text/xml');
        req1.onreadystatechange = function() {
            if (req1.readyState != 4) return;
            if (req1.status != 200 && req1.status != 304) {
                alert('HTTP error ' + req1.status);
                return;
            }
            alert('Feature saved successfully');
            geojson.getSource().refresh();
            overlay.setPosition(undefined);
            closer.blur();
            featureOverlay.getSource().clear();
        }
        req1.send(postData1);

    } catch (error) {
        console.error("Erro ao gerar GML3:", error);
    }
}

//voltar dia 26/08/2024
/*function save_created(button) {
    const featureId = button.getAttribute('data-feature-id');
    
    if (!featureId) {
        console.error("O ID da feature não foi definido.");
        return;
    }
    
    const feature = featureOverlay.getSource().getFeatureById(featureId);
    
    if (!feature) {
        console.error("A feature com o ID " + featureId + " não foi encontrada.");
        return;
    }

    console.log("Feature encontrada:", feature);

    if (!feature.getGeometry()) {
        console.error("A feature não possui geometria.");
        return;
    }

    // Verificar e gerar um ID temporário se não houver
    if (!feature.getId()) {
        console.warn("A feature não tem um ID. Tentando gerar GML sem ID...");
    }

    try {
        const gml3 = new ol.format.GML3().writeFeatureElement(feature);
        console.log("GML3 gerado com sucesso:", gml3);

        // Continue com o código para montar a transação WFS
        let postData1 = 
            '<wfs:Transaction service="WFS" version="1.1.0"\n' +
            'xmlns:adUcation="http://www.openplans.org/adUcation"\n' +
            'xmlns:ogc="http://www.opengis.net/ogc"\n' +
            'xmlns:wfs="http://www.opengis.net/wfs"\n' +
            'xmlns:gml="http://www.opengis.net/gml"\n' +
            'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n' +
            'xsi:schemaLocation="http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/WFS-transaction.xsd">\n';
        
        if (feature.getId()) {
            // Editar a feature existente
            postData1 += '<wfs:Update typeName="adUcation:persons">\n' +
                '<wfs:Property>\n' +
                '<wfs:Name>the_geom</wfs:Name>\n' +
                '<wfs:Value>' + gml3 + '</wfs:Value>\n' +
                '</wfs:Property>\n' +
                '<wfs:Property>\n' +
                '<wfs:Name>PERSONS</wfs:Name>\n' +
                '<wfs:Value>' + feature.get('PERSONS') + '</wfs:Value>\n' +
                '</wfs:Property>\n' +
                '<wfs:Property>\n' +
                '<wfs:Name>STATE_NAME</wfs:Name>\n' +
                '<wfs:Value>' + feature.get('STATE_NAME') + '</wfs:Value>\n' +
                '</wfs:Property>\n' +
                '<ogc:Filter>\n' +
                '<ogc:FeatureId fid="' + feature.getId() + '"/>\n' +
                '</ogc:Filter>\n' +
                '</wfs:Update>\n';
        } else {
            // Inserir uma nova feature
            postData1 += '<wfs:Insert>\n' +
                '<adUcation:population>\n' +
                '<adUcation:the_geom>\n' +
                gml3 + '\n' +
                '</adUcation:the_geom>\n' +
                '<adUcation:PERSONS>' + feature.get('PERSONS') + '</adUcation:PERSONS>\n' +
                '<adUcation:STATE_NAME>' + feature.get('STATE_NAME') + '</adUcation:STATE_NAME>\n' +
                '</adUcation:population>\n' +
                '</wfs:Insert>\n';
        }

        postData1 += '</wfs:Transaction>';

        // Enviar a transação WFS para o GeoServer
        var req1 = new XMLHttpRequest();
        req1.open("POST", 'http://localhost:8080/geoserver/wfs', false);
        req1.setRequestHeader('User-Agent', 'XMLHTTP/1.0');
        req1.setRequestHeader('Content-type', 'text/xml');
        req1.onreadystatechange = function() {
            if (req1.readyState != 4) return;
            if (req1.status != 200 && req1.status != 304) {
                alert('HTTP error ' + req1.status);
                return;
            }
            alert('Feature saved successfully');
            geojson.getSource().refresh();
            overlay.setPosition(undefined);
            closer.blur();
            featureOverlay.getSource().clear();
        }
        req1.send(postData1);
    } catch (error) {
        console.error("Erro ao gerar GML3:", error);
        console.log("Detalhes da feature:", feature);
    }
}*/


function cancel_created() {

    featureOverlay.getSource().clear();
    geojson.getSource().removeFeature(myFeature);
    overlay.setPosition(undefined);
    closer.blur();

}

function modify_feature() {
    //alert('change');
    document.getElementById("get_info").style.backgroundColor = '';
    map.un('singleclick', getinfo);
    map.un('click', highlight);
    overlay.setPosition(undefined);
    closer.blur();

    if (draw_add) {
        map.removeInteraction(draw_add);
    }
    if (snap_edit) {
        map.removeInteraction(snap_edit);
    }


    document.getElementById("select_feature").style.backgroundColor = '';
    document.getElementById("create_feature").style.backgroundColor = '';
    document.getElementById("modify_feature").style.backgroundColor = 'coral';
    source_mod = featureOverlay.getSource();
    modify = new ol.interaction.Modify({
        source: source_mod
    });
    map.addInteraction(modify);

    var source_g = geojson.getSource();
    snap_edit = new ol.interaction.Snap({
        source: source_g
    });
    map.addInteraction(snap_edit);
    map.on('click', highlight_mod_attributes);

}

function save_mod_features() {

    state_name = document.getElementById("state_name").value;
    persons = document.getElementById("persons").value;

    var feat_mod = featureOverlay.getSource().getFeatures();

    var fid_feat_mod = feat_mod[0].getId();
    var coords = feat_mod[0].getGeometry();

    var format = new ol.format.GML({
        srsName: 'urn:ogc:def:crs:EPSG::4326'
    });

    var gml3 = format.writeGeometry(coords, {
        featureProjection: 'urn:ogc:def:crs:EPSG::4326'
    });

    var url1 = 'http://localhost:8080/geoserver/topp/wfs';
    var postData =
        '<wfs:Transaction service="WFS" version="1.0.0"\n' +
        'xmlns:topp="http://www.openplans.org/topp"\n' +
        'xmlns:ogc="http://www.opengis.net/ogc"\n' +
        'xmlns:wfs="http://www.opengis.net/wfs"\n' +
        'xmlns:gml="http://www.opengis.net/gml"\n' +
        'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n' +
        'xsi:schemaLocation="http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/WFS-transaction.xsd">\n' +

        '<wfs:Update typeName="topp:states">\n' +
        '<wfs:Property>\n' +
        '<wfs:Name>the_geom</wfs:Name>\n' +
        '<wfs:Value>\n' +
        gml3 + '\n' +
        '</wfs:Value>\n' +
        '</wfs:Property>\n' +
        '<wfs:Property>\n' +
        '<wfs:Name>state_name</wfs:Name>\n' +
        '<wfs:Value>\n' +
        state_name + '\n' +
        '</wfs:Value>\n' +
        '</wfs:Property>\n' +
        '<wfs:Property>\n' +
        '<wfs:Name>persons</wfs:Name>\n' +
        '<wfs:Value>\n' +
        persons + '\n' +
        '</wfs:Value>\n' +
        '</wfs:Property>\n' +
        '<ogc:Filter>\n' +
        '<ogc:FeatureId fid="' + fid_feat_mod + '"/>\n' +
        '</ogc:Filter>\n' +
        '</wfs:Update>\n' +
        '</wfs:Transaction>\n';

    fetch(url1, {
        method: 'POST',
        headers: {
            'Content-Type': 'text/xml'
        },
        body: postData
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('HTTP error ' + response.status);
            }
            return response.text();
        })
        .then(data => {
            alert('Feature updated successfully');
            geojson.getSource().refresh();
            overlay.setPosition(undefined);
            closer.blur();
            featureOverlay.getSource().clear();
        })
        .catch(error => {
            alert('Error: ' + error.message);
        });
}

function cancel_mod_features() {

    featureOverlay.getSource().clear();
    overlay.setPosition(undefined);
    closer.blur();

}




/*function delete_feature() {

    del_feat = featureOverlay.getSource().getFeatures();
    //alert(del_feat);

    var fid_del_feat = del_feat[0].getId();
    //alert(fid_del_feat);

    if (confirm('Tem certeza de que deseja excluir o recurso selecionado?')) {
        // Save it!
        if (fid_del_feat == undefined) {
            featureOverlay.getSource().removeFeature(del_feat[0]);
            geojson.getSource().removeFeature(feature);
        } else if (fid_del_feat != undefined) {
            var feat = geojson.getSource().getFeatureById(fid_del_feat);
            //alert(feat);
            //modifyControl.unselectFeature(feature);
            geojson.getSource().removeFeature(feat);

            var feat1 = featureOverlay.getSource().getFeatureById(fid_del_feat);
            featureOverlay.getSource().removeFeature(feat1);

            var postData_del =
                '<wfs:Transaction service="WFS" version="1.0.0"\n' +
                'xmlns:cdf="http://www.opengis.net/cite/data"\n' +
                'xmlns:ogc="http://www.opengis.net/ogc"\n' +
                'xmlns:wfs="http://www.opengis.net/wfs"\n' +
                'xmlns:adUcation="http://www.openplans.org/adUcation">\n' +
                '<wfs:Delete typeName="adUcation:states">\n' +
                '<ogc:Filter>\n' +
                '<ogc:FeatureId fid="' + fid_del_feat + '"/>\n' +
                '</ogc:Filter>\n' +
                '</wfs:Delete>\n' +
                '</wfs:Transaction>\n';

            var req_del = new XMLHttpRequest();
            req_del.open("POST", 'http://localhost:8080/geoserver/wfs', false);
            req_del.setRequestHeader('User-Agent', 'XMLHTTP/1.0');
            req_del.setRequestHeader('Content-type', 'text/xml');
            req_del.onreadystatechange = function() {
                if (req_del.readyState != 4) return;
                if (req_del.status != 200 && req_del.status != 304) {
                    alert('HTTP error ' + req_del.status);
                    return;
                }
                // req_res[i] = req.responseText;


                // alert(req.responseText);
                //  Ext.MessageBox.alert('Status', 'changes saved successfully');
            }
            if (req_del.readyState == 4) return;
            req_del.send(postData_del);

            alert('Recurso excluído com sucesso');
            geojson.getSource().refresh();
            overlay.setPosition(undefined);
            closer.blur();

        }

    } else {
        // Do nothing!
        alert('Recurso não excluído');
        featureOverlay.getSource().clear();
        overlay.setPosition(undefined);
        closer.blur();
    }



}*/

function delete_feature() {
    const del_feat = featureOverlay.getSource().getFeatures();

    if (del_feat.length === 0) {
        alert('Nenhum recurso selecionado para exclusão');
        return;
    }

    const fid_del_feat = del_feat[0].getId();

    if (confirm('Tem certeza de que deseja excluir o recurso selecionado?')) {
        if (fid_del_feat === undefined) {
            featureOverlay.getSource().removeFeature(del_feat[0]);
            geojson.getSource().removeFeature(del_feat[0]);
        } else {
            const feat = geojson.getSource().getFeatureById(fid_del_feat);

            if (!feat) {
                alert('Recurso não encontrado no geojson source');
                return;
            }

            geojson.getSource().removeFeature(feat);

            const feat1 = featureOverlay.getSource().getFeatureById(fid_del_feat);

            if (feat1) {
                featureOverlay.getSource().removeFeature(feat1);
            }

            const postData_del =
                '<wfs:Transaction service="WFS" version="1.1.0"\n' +
                'xmlns:cdf="http://www.opengis.net/cite/data"\n' +
                'xmlns:ogc="http://www.opengis.net/ogc"\n' +
                'xmlns:wfs="http://www.opengis.net/wfs"\n' +
                'xmlns:topp="http://www.openplans.org/topp">\n' +
                '<wfs:Delete typeName="topp:states">\n' +
                '<ogc:Filter>\n' +
                '<ogc:FeatureId fid="' + fid_del_feat + '"/>\n' +
                '</ogc:Filter>\n' +
                '</wfs:Delete>\n' +
                '</wfs:Transaction>\n';

            const req_del = new XMLHttpRequest();
            req_del.open("POST", 'http://localhost:8080/geoserver/wfs', false);
            req_del.setRequestHeader('User-Agent', 'XMLHTTP/1.0');
            req_del.setRequestHeader('Content-type', 'text/xml');
            req_del.onreadystatechange = function () {
                if (req_del.readyState != 4) return;
                if (req_del.status != 200 && req_del.status != 304) {
                    alert('HTTP error ' + req_del.status);
                    return;
                }
                // alert(req_del.responseText);
            };
            if (req_del.readyState == 4) return;
            req_del.send(postData_del);

            alert('Recurso excluído com sucesso');
            geojson.getSource().refresh();
            overlay.setPosition(undefined);
            closer.blur();
        }
    } else {
        alert('Recurso não excluído');
        featureOverlay.getSource().clear();
        overlay.setPosition(undefined);
        closer.blur();
    }
}




function get_info() {

    featureOverlay.getSource().clear();
    overlay.setPosition(undefined);
    closer.blur();
    var color = $('#get_info').css("background-color");

    if (color == 'rgb(239, 239, 239)') {
        //alert(color);
        if (modify) {
            map.removeInteraction(modify);
        }
        if (draw_add) {
            map.removeInteraction(draw_add);
        }
        if (snap_edit) {
            map.removeInteraction(snap_edit);
        }

        document.getElementById("get_info").style.backgroundColor = 'coral';
        document.getElementById("select_feature").style.backgroundColor = '';
        document.getElementById("create_feature").style.backgroundColor = '';
        document.getElementById("modify_feature").style.backgroundColor = '';
        map.un('click', highlight);
        map.un('click', highlight_mod_attributes);
        map.on('singleclick', getinfo);

    } else if (color == 'rgb(255, 127, 80)') {
        //alert(color);
        document.getElementById("get_info").style.backgroundColor = '';
        map.un('singleclick', getinfo);
        overlay.setPosition(undefined);
        closer.blur();
        //map.on('click', highlight);

    }

}

function getinfo(evt) {


    var coordinate = evt.coordinate;
    var viewResolution = /** @type {number} */ (view.getResolution());

    //alert(coordinate1);
    $("#popup-content").empty();

    document.getElementById('info').innerHTML = '';
    var no_layers = overlays.getLayers().get('length');
    // alert(no_layers);
    var url = new Array();
    var wmsSource = new Array();
    var layer_title = new Array();


    var i;
    for (i = 0; i < no_layers; i++) {
        //alert(overlays.getLayers().item(i).getVisible());
        var visibility = overlays.getLayers().item(i).getVisible();
        //alert(visibility);
        if (visibility == true) {
            //alert(i);
            layer_title[i] = overlays.getLayers().item(i).get('title');
            // alert(layer_title[i]);
            wmsSource[i] = new ol.source.ImageWMS({
                url: 'http://localhost:8080/geoserver/wms',
                params: {
                    'LAYERS': layer_title[i]
                },
                serverType: 'geoserver',
                crossOrigin: 'anonymous'
            });
            //alert(wmsSource[i]);
            //var coordinate2 = evt.coordinate;
            // alert(coordinate);
            url[i] = wmsSource[i].getFeatureInfoUrl(
                evt.coordinate, viewResolution, 'EPSG:4326', {
                'INFO_FORMAT': 'text/html'
            });
            //  alert(url[i]);

            //assuming you use jquery
            $.get(url[i], function (data) {
                //alert(i);
                //append the returned html data


                // $("#info").html(data);
                //document.getElementById('info').innerHTML = data;
                //document.getElementById('popup-content').innerHTML = '<p>Feature Info</p><code>' + data + '</code>';

                //alert(dat[i]);
                $("#popup-content").append(data);
                //document.getElementById('popup-content').innerHTML = '<p>Feature Info</p><code>' + data + '</code>';

                overlay.setPosition(coordinate);

                layerSwitcher.renderPanel();

            });
            //alert(layer_title[i]);
            //alert(fid1[0]);



        }
    }


}





//Initialize Google Maps and specify a container for the Map to appear
var myLatLng = new google.maps.LatLng(40.693655, -73.861427); //Specify initial location for the center of the map
MYMAP.init('#map_canvas', myLatLng, 11);

//Directory to the XML file that powers the points of interest which populate the map. 
MYMAP.placeMarkers(templateDir+'/includes/projects.xml');

//Extra functionality 
$('#reset_map').click(function(){MYMAP.map.fitBounds(MYMAP.bounds);});
$('#zoom_in_map').click(function(){MYMAP.map.setZoom(MYMAP.map.getZoom() + 1);});  
$('#zoom_out_map').click(function(){MYMAP.map.setZoom(MYMAP.map.getZoom() - 1);});


//Google Maps, usually can be located outside of document ready tag since the code up top calls initializes the code bellow.
var MYMAP = {map: null, bounds: null}

MYMAP.init = function(selector, latLng, zoom) {
  var styles = [
   {
      stylers: [
        { hue: "#000000" },
        { saturation: -100 }
      ]
    },{
      featureType: "road",
      elementType: "geometry",
      stylers: [
        { lightness: 100 },
        { visibility: "on" }
      ]
    },{
      featureType: "road",
      elementType: "labels",
      stylers: [
        { visibility: "on" }
      ]
     },{
      featureType: "water",
      elementType: "geometry",
      stylers: [
        { color: "#1ab78d" }
      ]
    },
  {
    featureType: "road",
    elementType: "labels.text.stroke",
    stylers: [
      { visibility: "off" }
    ]
  }
  ];

  var styledMap = new google.maps.StyledMapType(styles,{name: "Name of map goes here"});

  var myOptions = {
    zoom: 12,
    scrollwheel: false,
    center: latLng,
    disableDefaultUI: true,
    mapTypeControlOptions: {
      mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'map_style']
    }
  }

  this.map = new google.maps.Map($(selector)[0], myOptions);
  this.bounds = new google.maps.LatLngBounds();
  this.map.mapTypes.set('map_style', styledMap);
  this.map.setMapTypeId('map_style');
}

MYMAP.placeMarkers = function(filename) {
  $.get(filename, function(xml){
    $(xml).find("marker").each(function(){
      var name = $(this).find('name').text();
      var address = $(this).find('addy').text();
      
      // create a new LatLng point for the marker
      var lat = $(this).find('lat').text();
      var lng = $(this).find('lng').text();
      var point = new google.maps.LatLng(parseFloat(lat),parseFloat(lng));
      
      // extend the bounds to include the new point
      MYMAP.bounds.extend(point);
      
      var markerShadow = {
      //Directory for the marker shadow
      url: templateDir + '/images/marker_shadow.png',
      anchor: new google.maps.Point(3, 55)
      };

      var marker = new google.maps.Marker({
        position: point,
        map: MYMAP.map,
        //Directory for the marker
        icon: templateDir + '/images/marker.png',
        shadow: markerShadow
      });

      var infobox = new InfoBox({
        content: document.getElementById("infobox"),
        disableAutoPan: false,
        maxWidth: 500,
        pixelOffset: new google.maps.Size(30, -170),
        zIndex: null,
        closeBoxMargin: "5px",
        //Directory for the close button of the popup
        closeBoxURL: templateDir + '/images/infobox_close.png',
        infoBoxClearance: new google.maps.Size(1, 1)
      });

      var gmarkers = [];
      var top_bar_nav = "";
       
      gmarkers.push(marker);

      //Information that should go into the Gmaps popup modal
      var html='<div class="infoBox_content"><span class="infoBox_name">'+name+'</span><p class="infoBox_addy">'+address+'</p><a class="infoBox_link" target="_blank" href="http://maps.google.com/maps?saddr={start_address}&daddr='+address+'">Directions</a></div>';
      google.maps.event.addListener(marker, 'click', function() {
        infobox.close();
        infobox.setContent(html);
        infobox.open(MYMAP.map, marker);
      });
      google.maps.event.addListener(MYMAP.map, 'click', function() {
        infobox.close();
      });
      
      MYMAP.map.fitBounds(MYMAP.bounds);
    });
  });
}
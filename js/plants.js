var source   = $("#plant-template").html();
var template = Handlebars.compile(source);
var plants = [];

function showPlants(json){
  var data = json.data;
  var context = [];

  for(var key in data) {
    var value = data[key];
    var plant = {
      comName: value.com_name,
      sciName: value.sci_name,
      image: '<img src="http://placehold.it/150?text=Image+Unavailable" alt=""'
    };
    context.push(plant);
    var html = template(plant);
    plants.push(html);
  }

  plants.sort();
  for(var i=0; i<plants.length; i++) {
    $('.plant-container').append(plants[i]);
  }
}

function getPlants() {
  var req = "https://www.hort.net/uiplants-api/listPlants?key=7Vek7WIbv9FqPoKxjD7AriIj&regexp=(\w+)";

  var jqxhr = $.getJSON(req, function(data) {
    showPlants(data);
  })
  .done(function() {
    console.log( "success" );
  })
  .fail(function() {
    console.log( "error" );
  })
  .always(function() {
    console.log( "complete" );
  });
}

$(document).foundation();

$(document).ready(function() {
  getPlants();
});

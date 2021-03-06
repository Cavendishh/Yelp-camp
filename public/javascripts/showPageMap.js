mapboxgl.accessToken = mapToken

//Create a map using map box services
const map = new mapboxgl.Map({
  container: 'showMap',
  style: 'mapbox://styles/mapbox/light-v10', // stylesheet location
  center: campground.geometry.coordinates, // starting position [lng, lat]
  zoom: 10 // starting zoom
})

//Add buttons to navigate on map
map.addControl(new mapboxgl.NavigationControl());

//Add markers for map on show page
new mapboxgl.Marker()
  .setLngLat(campground.geometry.coordinates)
  .setPopup(
    new mapboxgl.Popup({ offset: 25 })
    .setHTML(
      `<h3>${campground.title}</h3><p>${campground.location}</p>`
    )
  )
  .addTo(map)
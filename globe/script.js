//import {Spinner} from 'spin.js';

var opts = {
  lines: 13, // The number of lines to draw
  length: 38, // The length of each line
  width: 17, // The line thickness
  radius: 45, // The radius of the inner circle
  scale: 1, // Scales overall size of the spinner
  corners: 1, // Corner roundness (0..1)
  speed: 1, // Rounds per second
  rotate: 0, // The rotation offset
  animation: 'spinner-line-fade-quick', // The CSS animation name for the lines
  direction: 1, // 1: clockwise, -1: counterclockwise
  color: '#333', // CSS color or array of colors
  fadeColor: 'transparent', // CSS color or array of colors
  top: '50%', // Top position relative to parent
  left: '50%', // Left position relative to parent
  shadow: '0 0 1px transparent', // Box-shadow for the lines
  zIndex: 0, // The z-index (defaults to 2e9)
  className: 'spinner', // The CSS class to assign to the spinner
  position: 'absolute', // Element positioning
};

var spinner
import('./spin/spin.js')
  .then((Spin) => {
    var target = document.getElementById('loading');
    spinner = new Spin.Spinner(opts).spin(target);
  })
  .catch(console.error);



//const WELCOME_AUDIO = new Audio('audio/audiozoom.mp4')
const WELCOME_AUDIO = new Audio('audio/audio.wav')
WELCOME_AUDIO.loop = false
//WELCOME_AUDIO_START = 1
WELCOME_AUDIO_START = 0
var PLAYWELCOME = false
const WELCOMEINTERVALTIME = 2000

var closeSearch2


// Remove video if testing locally
if (window.location.href.includes('home/antonio'))
  $('iframe').remove()

// &#9202;   clock
// &#128392; map-marker

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const isLightScheme = urlParams.get('scheme') === 'dark' ? false : true // dark, light
const isSideTour = urlParams.get('tour') === 'sidepanel' ? true : false // tooltip, sidepanel
const paramAlt = parseFloat(urlParams.get('altitude')) || 7

if (!isLightScheme) {
  document.body.classList.add('dark')
  const icons = document.getElementsByClassName('icon')
  for (var i=0; i<icons.length; i++) {
    var icon = icons[i]
    icon.classList.add('dark')
  }
}


const globeDiv = document.getElementById('globeViz')
const globe = Globe()(globeDiv)

const gl = globe.renderer().getContext();
const maxSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);

const globeTextures = {
  16384: 'earth-maps/sizes/map_16384x8192.png',
   8192: 'earth-maps/sizes/map_8192x4096.png',
   4096: 'earth-maps/sizes/map_4096x2048.png',
   2048: 'earth-maps/sizes/map_2048x1024.png',
   1024: 'earth-maps/sizes/map_1024x512.png',
};

function pickTexture(ms) {
  return (
    (ms > 16384 && globeTextures[16384]) ||
    (ms >= 8192 && globeTextures[8192]) ||
    (ms >= 4096 && globeTextures[4096]) ||
    (ms >= 2048 && globeTextures[2048]) ||
    globeTextures[1024]
  );
}

// Params
//const lightGlobeImage = 'earth-maps/light_gray_HD.png'
const lightGlobeImage = pickTexture(maxSize)
const darkGlobeImage = 'earth-maps/dark_gray_HD.png'
const lightBackgroundColor = '#ffffff'
const darkBackgroundColor = '#1a1a1a'
const lightPoleColor = '#ffffffee' // for dark scheme
const darkPoleColor = '#00000080' // for light scheme

var globeImage = isLightScheme ? lightGlobeImage : darkGlobeImage
var poleColor = isLightScheme ? darkPoleColor : lightPoleColor
var backgroundColor = isLightScheme ? lightBackgroundColor : darkBackgroundColor

const params = {
  globe: {
    wrapImages: [
      lightGlobeImage,
      'earth-maps/new-base-maps/grey1.png',
      'earth-maps/new-base-maps/grey2.png',
      'earth-maps/new-base-maps/grey3.png',
      'earth-maps/new-base-maps/grey4.png',
      darkGlobeImage,
    ],
    backgroundColors: [
      lightBackgroundColor,
      darkBackgroundColor,
    ],
  },
  point: { // visible pole
    colors: [
      darkPoleColor,
      lightPoleColor,
    ],
    //color: darkPoleColor,
    color: poleColor,
    hexColor: null, // #808080
    opacity: null, // 0.4
    radius: 0.01,
  },
  point2: { // hidden highlightable pole
    color: '#00000000',
    hexColor: null, // #000000
    opacity: null, // 0
//    highColor: '#404040CC',
    highColor: darkPoleColor,
    highHexColor: null, // #00FFFF
    highOpacity: null, // 0.8
    radius: 0.1,
  },
  labelCity: {
    color: isLightScheme ? '#333333FF' : '#f0f0f0FF',
    hexColor: null, // #333333
    opacity: null, // 1
    size: 0.15,
    highColor: '#FF5000FF',
    highHexColor: null, // #FF5000
    highOpacity: null, // 1
  },
  labelCityBckg: {
    color: '#00000000',
    hexColor: null, // #000000
    opacity: null, // 0
    size: 3,
  },
  labelYear: {
    color: isLightScheme ? '#808080CC': '#c0c0c0cc',
    hexColor: null, // #808080
    opacity: null, // 0.8
    size: 0.1,
  },
  path: { // thick colored visible line
    color: 'color',
    stroke: 0.15, // 0.35, // 0.15,
    highHexColor: '#FF00FF',
    highStroke: 1,
  },
  path2: { // thin hidden line
    dashLength: 1,
    dashGap: 0.5,
    dashAnimateTime: 500,
    colorOff: '#FFFFFF00',
    colorOn: '#FFFFFFFF',
  },
  dot: { // no opacity allowed
    sphereColor: '#008000',
    sphereRGBColor: null, // {r:0, g:0.5019607843137255, b:0}
    sphereRadius: 0.03, // 0.05,
    sphereRadiusScale: 11,
    hSphereColor: '#000000',
    hSphereRGBColor: '#00FFFF', // null, // {r:0, g:0, b:0}
    hSphereRadiusScale: 22,
    tickColor: '#808080',
    tickRadius: 0.01, //0.1,
    highSphereColor: '#ff8000',
  },
  light: {
    position: 'right',
    intensity: 0.6,
    aIntensity: 1.5,
  }
}
for (k in params) {
    var objParams = params[k]
    if ('hexColor' in objParams && 'opacity' in objParams && 'color' in objParams)
        [objParams['hexColor'], objParams['opacity']] = hexa2hexAndAlpha(objParams['color'])
    if ('highHexColor' in objParams && 'highOpacity' in objParams && 'highColor' in objParams)
        [objParams['highHexColor'], objParams['highOpacity']] = hexa2hexAndAlpha(objParams['highColor'])
    if ('sphereRGBColor' in objParams && 'sphereColor' in objParams)
        objParams['sphereRGBColor'] = hex2rgbNorm(objParams['sphereColor'])
    if ('hSphereRGBColor' in objParams && 'hSphereColor' in objParams)
        objParams['hSphereRGBColor'] = hex2rgbNorm(objParams['hSphereColor'])
}




// Important values
const scene = globe.scene()
const camera = globe.camera()
const controls = globe.controls()
const renderer = globe.renderer()
var pointsD, labelsD, pathsD, paths2D, dotsD
var defaultAlt = 7
const initLoc = { lat: 10, lng: -88.16, altitude: defaultAlt } // Joliet
const basicTravelTransition = 2000
const restartTransition = basicTravelTransition * 2
const jumpTransition = basicTravelTransition
const tourTransition = basicTravelTransition * 4
const LAT = 10
var is5053 = false
var scrollInRange = true
var hideDescTimeout
var myPathsData

var mainRect = document.getElementById('main-content').getBoundingClientRect()
var INIT_WIDTH = mainRect.width // 1280
var INIT_HEIGHT = mainRect.height // 720
var RECT_SIZE = Math.min(INIT_WIDTH, INIT_HEIGHT)
const SIZE_THRESHOLD = 650
var WIDTH =  RECT_SIZE * 3//(RECT_SIZE < SIZE_THRESHOLD ? 2 : 3) // same width as height to make it square
var HEIGHT = RECT_SIZE * 3//(RECT_SIZE < SIZE_THRESHOLD ? 2 : 3)

const myTooltip2 = document.getElementById('my-tooltip-2')

//const canvas = document.querySelector('#globeViz canvas');
//canvas.style.width = `${INIT_WIDTH}px`;
//canvas.style.height = `${INIT_HEIGHT}px`;
//canvas.style.position = 'absolute';
//canvas.style.left = '50%';
//canvas.style.top = '37.5%';
//canvas.style.transform = 'translate(-50%, -37.5%)';

//globe.style.width = `${INIT_WIDTH}px`;
//globe.style.height = `${INIT_HEIGHT}px`;
//globe.style.position = 'absolute';
//globe.style.left = '50%';
//globe.style.top = '50%';
//globe.style.transform = 'translate(-50%, -50%)';

// Combination of solutions
globe.onReady2(() => {
  const initialFrame = renderer.info.render.frame
  function waitForVisible() {
    if (globe.globeMaterial().map?.image?.complete && renderer.info.render.frame > initialFrame) {
      setTimeout(() => {
        $('#loading').css('opacity', 0)
        $('#play-pause-container').css('opacity', 1)
        setTimeout(() => {
          //$('#loading').hide()
          spinner.stop()
          
          function removeIntro(ev) {
            $('#play-pause-container.intro').removeClass('intro')
            $('#interface.intro').removeClass('intro')
            $('#intro').hide()
          }
          $('#play-pause-container.intro').on('mousedown', removeIntro)
          $('#intro').on('mousedown', removeIntro)
          setTimeout(() => { removeIntro() }, 3000)
          
        }, 1000)
      }, 10)

    } else {
      requestAnimationFrame(waitForVisible);
    }
  }
  
  waitForVisible()
})

//const initialFrame = renderer.info.render.frame
//function waitForVisible() {
//  if (globe.globeMaterial().map?.image?.complete && renderer.info.render.frame > initialFrame) {
////      loadingEl.style.display = 'none';
//    console.log('Globe now visible');
//  } else {
//    console.log('???')
//    requestAnimationFrame(waitForVisible);
//  }
//}
//waitForVisible()




var STATUS
var COLOR
var STATUS_BACKGROUNDCOLOR = 1

let layoutTimer;
    
// Code 1
init()
awaitData()

//window.onmousemove = function(ev) {
//    if (ev.y < 60) {
//    }
//}

// Functions 1
function drawGlobe() {
  //globe.globeImageUrl(params.globe.wrapImages[0])
  globe.globeImageUrl(globeImage)
  //globe.showAtmosphere(!isLightScheme)
  globe.showAtmosphere(false)
  //scene.background = new THREE.Color(params.globe.backgroundColors[0])
  scene.background = new THREE.Color(backgroundColor)
  //document.getElementById('main-content').style.backgroundColor = params.globe.backgroundColors[0]
  document.getElementById('main-content').style.backgroundColor = backgroundColor
}

function init() {
    drawGlobe()
    
    
    const R = (270 - (-90)) / (2 * Math.PI)
    
    //var mleft = window.innerWidth/2
    //var mtop = 50
    //$('#mytooltip').css( { marginLeft : mleft+"px", marginTop : mtop+"px", position: "fixed" } );
    
    //const distThreshold = 2.5
    //var prevAlt = initLoc.altitude <= distThreshold ? 'close' : 'far'
    //var currentAlt
    //function updateLabelSize (altitude) {
    //    currentAlt = altitude <= distThreshold ? 'close' : 'far'
    //    if (currentAlt != prevAlt) {
    //        if (currentAlt == 'close')
    //            globe.labelSize(d => d.type == 'city' ? params.labelCity.closeSize : params.labelYear.size)
    //        else // (currentAlt == 'far')
    //            globe.labelSize(d => d.type == 'city' ? params.labelCity.farSize : params.labelYear.size)
    //        prevAlt = currentAlt
    //    }
    //}
    
    delayedUpdateLayout()
    
    
    globe
    .width(WIDTH)
    .height(HEIGHT)
    .pointOfView(initLoc, 4000)
    .onZoom(function (loc) {
        if (typeof controls.MOUSE_EVENT !== 'undefined') {
            // Scroll
            // > 0 => scroll down
            // < 0 => scroll up
            if (controls.MOUSE_EVENT.action == 'scroll' && !controls.MOUSE_EVENT.ctrlKey) {
                var deltaY = controls.MOUSE_EVENT.deltaY
                var step = deltaY < 0 ? -1 : 1
                step *= 100
                window.scrollBy(0, step)
            }
            else {
//              if (loc.altitude < defaultAlt - 0.5)
//                $('#description').removeClass('visible')
//              else
//                $('#description').addClass('visible')
              
//              if (controls.MOUSE_EVENT.deltaY > 0 && loc.altitude < 9) { // zout && altitude < 9
//                if (controls.target.y < 0) {
//                  controls.target.y = Math.min(controls.target.y + 1, 0)
//                }
//                else if (controls.target.y > 0) {
//                  controls.target.y = Math.max(controls.target.y - 1, 0)
//                }
//                else {
//                  //controls.update()
//                }
//              }
            }
            
            // Reset status
            setTimeout(() => {
                controls.MOUSE_EVENT.action = null
            }, 100);
        }
        // Out of MOUSE_EVENT type to make it work on touch screens
        if (!globeInMotion()) {
          if (loc.altitude < defaultAlt - 0.5)
            $('#description').removeClass('visible')
          else
            $('#description').addClass('visible')
        }
        
        
        // Flash light holder
        //if (scene.children.length >= 3) {
        //    var sect = ev.lng + 90
        //    var ang = sect / R
        //    var X = R * Math.sin(ang) * (params.light.position == 'left' ? -1 : 1)
        //    var Z = R * Math.cos(ang) * (params.light.position == 'left' ? -1 : 1)
        //    var myLight = scene.children[2]
        //    myLight.position.set(X, 0, Z)
        //}
    })
    .onPointClick(d => {
//      if (leftClick)
        clickOnPole(d)
    })
    .onCustomLayerClick(d => {
//      if (leftClick)
        clickOnSphere(d)
    })
    .onPointHover((d, prev) => {
      if (!globeInMotion()) {
        if (prev)
          unhoverOnPole(prev)
        if (d) {
          hoverOnPole(d)
          if (lastPointerType === 'touch') {
            clickOnPole(d)
          }
        }
      }
    })
    .onCustomLayerHover((d, prev) => {
      if (!globeInMotion()) {
        if (prev)
          unhoverOnSphere(prev)
        if (d) {
          hoverOnSphere(d)
          if (lastPointerType === 'touch') {
            clickOnSphere(d)
          }
        }
      }
    })
    .onRightClick(() => {
//      if (window._tweenPaused)
//        resumeTweens()
//      else
//        pauseTweens()
    })
    .onClick(obj => {
      if (obj === null) { // sky
        if (!playTour) {
          clearSelection()
          hideTooltip()
          clearTour()
        }
      }
    })
    
    // Light
    setTimeout(() => {
        if (scene.children.length >= 3) {
            scene.children[1].intensity = params.light.aIntensity // ambient light high intensity
            scene.children[2].intensity = 0 // no flash light
        }
    }, 100);
    
    controls.dampingFactor = 1
    controls.rotateSpeed = 1
    
    const defaultPixelRatio = renderer.getPixelRatio()
    const adjustedPixelRatio = Math.min(2, defaultPixelRatio)
    renderer.setPixelRatio(adjustedPixelRatio)
//    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
//    const safePixelRatio = 1//isIOS ? 1 : adjustedPixelRatio
//    renderer.setPixelRatio(safePixelRatio)
    
    // Globe coordinates
    // TODO
}

function awaitData() {
    d3.queue()
    .defer(d3.csv, 'data/points5889_NADAC.csv')
    .defer(d3.csv, 'data/labels5889_NADAC.csv')
    .defer(d3.csv, 'data/paths5889_NADAC.csv')
    //.defer(d3.csv, 'data2/path_basic_colors5889.csv')
    .defer(d3.csv, 'data/path_colors5889_NADAC_2.csv')
    //.defer(d3.csv, 'data2/color_timeline5889.csv')
    .defer(d3.csv, 'data/places_venues_repertory_5889_NADAC.csv')
    .defer(d3.json, 'data/nested_places_venues_repertory_5889_NADAC.json')
    .defer(d3.csv, 'data/state-abbrev.csv')
    .await(ready)
}

function ready(error, pointsData, labelsData, pathsData, pathColorsData, venuesData, nestedVenuesData, abbrevData) {
//function ready(error, pointsData, labelsData, pathsData, pathColorsData, timelineColorData, venuesData, nestedVenuesData, abbrevData) {
//function ready(error, pointsData, pathsData, pathColorsData) {
    // Code 2
    readData()
    loadData()
    drawInit()
    setTimeout(() => {
      drawTransitionToDefault3()
      setTimeout(() => {
        prepareHighlightableData()
        
        globe
        .pointsTransitionDuration(0)
        //.labelsTransitionDuration(0)
        .pathTransitionDuration(0)
        //.path2TransitionDuration(0)
      }, 2000)
    }, 3000)
    
    

    //drawTransitionToDefault()
    //drawTransitionToDefault2()
    
    //prepareTouringData()
    //stop()
    
    // Functions 2
    function readData() {
        var points = []
        var pointLabelsDictList = {}
        var pointAndLabelIdDict = {}
        var pointTickDates = {}
        var labels = []
        var paths = []
        //var paths2 = []
        var pathLabels = []
        var pathCities = []
        var pathDates = []
        var pathActions = []
        var dots = []
        
        var alts = unpack(pointsData, 'Altitude')
        var totalDays = Math.max.apply(null, alts)
        
        const venues = Object.fromEntries(
          venuesData.map(({ Place, ...rest }) => [Place, rest])
        )
        
        for (var i=0; i<pointsData.length; i++) {
            var pointData = pointsData[i]
            var point = {
                lat: pointData['Latitude'] * 1, // parseInt
                lng: pointData['Longitude'] * 1,
                altitude: pointData['Altitude'] / (totalDays * 10/4),
                city: pointData['City'],
                id: i,
                type: 'thinPole', // thinPole or thickPole
                name: null, // label (to be filled below)
            }
            var point2 = {
                lat: pointData['Latitude'] * 1,
                lng: pointData['Longitude'] * 1,
                altitude: pointData['Altitude'] / (totalDays * 10/4),
                city: pointData['City'],
                id: i,
                type: 'thickPole', // thinPole or thickPole
                name: null, // label (to be filled below)
            }
//            for (var i2=pointData['Altitude']; i2>=0; i2-=200) {
//              var point2 = {
//                  lat: pointData['Latitude'] * 1,
//                  lng: pointData['Longitude'] * 1,
//                  altitude: i2 / (totalDays * 10/4),
//                  city: pointData['City'],
//                  id: i+'-'+i2,
//                  type: 'thickPole', // thinPole or thickPole
//                  name: null, // label (to be filled below)
//                  color: timelineColorData[i2]['color']
//              }
//              points.push(point2)
//            }
            points.push(point)
            points.push(point2)
            pointLabelsDictList[pointData['City']] = []
            pointAndLabelIdDict[pointData['City']] = i
            pointTickDates[pointData['City']] = []
            
            var dot = {
                lat: pointData['Latitude'] * 1,
                lng: pointData['Longitude'] * 1,
                alt: 0 / (totalDays * 10/4),
                type: 'tick', // sphere or tick
                name: null, // label
            }
            dots.push(dot) // comment this line for no ticks
        }
        
//        for (var i=0; i<labelsData.length; i++) {
//            var labelData = labelsData[i]
//            if (labelData['Type'] == 'city') {
//                var label = {
//                    lat: labelData['Latitude'] - (labelData['Type'] == 'city' ? 0.2 : 0),
//                    lng: labelData['Longitude'] - (labelData['Type'] == 'city' ? 0 : -0.3),
//                    altitude: labelData['Altitude'] / (totalDays * 10/4),
//                    type: labelData['Type'], // city or year
//                    text: labelData['Text'], // label
//                    id: pointAndLabelIdDict[labelData['Text']]
//                }
//                var label2 = {
//                    lat: labelData['Latitude'] - (labelData['Type'] == 'city' ? 0.2 : 0),
//                    lng: labelData['Longitude'] - (labelData['Type'] == 'city' ? 0 : -0.3),
//                    altitude: labelData['Altitude'] / (totalDays * 10/4),
//                    type: 'citybckg', // city or year
//                    text: '_', // label
//                    text2: labelData['Text'], // label
//                    id: pointAndLabelIdDict[labelData['Text']]
//                }
//                labels.push(label)
//                labels.push(label2)
//            }
            //if (labelData['Type'] == 'year') {
            //    var dot = {
            //        lat: labelData['Latitude'],
            //        lng: labelData['Longitude'],
            //        alt: labelData['Altitude'] / (totalDays * 10/4),
            //        type: 'tick', // sphere or tick
            //        name: null, // label
            //    }
            //    dots.push(dot)
            //}
//        }
        
        
        var LABEL_LNG_SHIFT = 0.3
        var pathData = pathsData[0]
        var p1 = [
            pathData['Latitude'] / 1,
            pathData['Longitude'] / 1,
            pathData['Altitude'] / (totalDays * 10/4),
        ] // pathsData
        var city1 = pathData['City']
        var date1 = pathData['Date']
        var action = 'arrival'
        
        var dotColorAttr = 'Hexcode4'
        var dotColorIndex = 0
        var dotColor = pathColorsData[dotColorIndex][dotColorAttr]
        var dotColor1 = pathColorsData[dotColorIndex]['Hexcode1']
        var dotColor2 = pathColorsData[dotColorIndex]['Hexcode2']
        var dotColor3 = pathColorsData[dotColorIndex]['Hexcode3']
        var dotColor4 = pathColorsData[dotColorIndex]['Hexcode4']
        var dotColor5 = pathColorsData[dotColorIndex]['Hexcode5']
        var dotColor6 = pathColorsData[dotColorIndex]['Hexcode6']
        var dotColor7 = pathColorsData[dotColorIndex]['Hexcode7']
        var dotColor8 = pathColorsData[dotColorIndex]['Hexcode8']
        
        var dot = {
            lat: pathData['Latitude'],
            lng: pathData['Longitude'],
            alt: pathData['Altitude'] / (totalDays * 10/4),
            type: 'sphere', // sphere or tick
            name: `<div class="dot tooltip"><span class="label">&#9202; ${action=='arrival'?'Arrived to':'Left from'} ${pathData['City']} on ${pathData['Date']}</span></div>`,
//            name: null,
            city: pathData['City'],
            date: pathData['Date'],
            action: action,
            color: dotColor,
            color1: dotColor1,
            color2: dotColor2,
            color3: dotColor3,
            color4: dotColor4,
            color5: dotColor5,
            color6: dotColor6,
            color7: dotColor7,
            color8: dotColor8,
        }
        dots.push(dot)
        
//        var label
//        var year = pathData['Date'].split(', ')[1]
//        if (!pointTickDates[city1].includes(year)) {
//            label = {
//                lat: pathData['Latitude'] / 1,
//                lng: pathData['Longitude'] / 1 + LABEL_LNG_SHIFT,
//                altitude: pathData['Altitude'] / (totalDays * 10/4),
//                type: 'year', // city or year
//                text: year,
//                id: null,
//            }
//            labels.push(label)
//            pointTickDates[city1].push(year)
//        }
        
        var p2, city2
        for (var i=1; i<pathsData.length; i++) {
            pathData = pathsData[i]
            p2 = [
                pathData['Latitude'] / 1,
                pathData['Longitude'] / 1,
                pathData['Altitude'] / (totalDays * 10/4),
            ] // pathsData
            city2 = pathData['City']
            date2 = pathData['Date']
            paths.push([p1, p2]) // pathsData
//            var pLabel
            //action = city1 == city2 ? 'departure' : 'arrival'
            action = i%2!=0 ? 'departure' : 'arrival'
            if (action == 'departure') {
                if (city1 != city2) ERROR
                pointLabelsDictList[city2].push([date1, date2])
//                pLabel = `<div class="path tooltip"><i class="fa fa-compass"></i><span class="label"> In ${city1} from ${date1} to ${date2}</span></div>`
            }
//            else
//                pLabel = `<div class="path tooltip"><i class="fa fa-compass"></i><span class="label"> From ${city1} to ${city2} on ${pathData['Date']}</span></div>`
//            pathLabels.push(pLabel)
            pathCities.push({'src': city1, 'dst': city2}) // filtering paths by source, destination, and date
            pathDates.push(pathData['Date'])              // filtering paths by source, destination, and date
//            pathActions.push(action)
            p1 = p2 // pathsData
            city1 = city2
            date1 = date2
            var dotColorAttr = 'Hexcode4'
            var dotColorIndex = i < pathColorsData.length ? i : pathColorsData.length - 1
            var dotColor = pathColorsData[dotColorIndex][dotColorAttr]
            var dotColor1 = pathColorsData[dotColorIndex]['Hexcode1']
            var dotColor2 = pathColorsData[dotColorIndex]['Hexcode2']
            var dotColor3 = pathColorsData[dotColorIndex]['Hexcode3']
            var dotColor4 = pathColorsData[dotColorIndex]['Hexcode4']
            var dotColor5 = pathColorsData[dotColorIndex]['Hexcode5']
            var dotColor6 = pathColorsData[dotColorIndex]['Hexcode6']
            var dotColor7 = pathColorsData[dotColorIndex]['Hexcode7']
            var dotColor8 = pathColorsData[dotColorIndex]['Hexcode8']
            dot = {
                lat: pathData['Latitude'],
                lng: pathData['Longitude'],
                alt: pathData['Altitude'] / (totalDays * 10/4),
                type: 'sphere', // sphere or tick
                name: `<div class="dot tooltip"><span class="label">&#9202; ${action=='arrival'?'Arrived to':'Left from'} ${pathData['City']} on ${pathData['Date']}</span></div>`,
                //name: null,
                city: pathData['City'],
                date: pathData['Date'],
                action: action,
                color: dotColor,
                color1: dotColor1,
                color2: dotColor2,
                color3: dotColor3,
                color4: dotColor4,
                color5: dotColor5,
                color6: dotColor6,
                color7: dotColor7,
                color8: dotColor8,
            }
            if (action == 'arrival') // only one sphere (arrival) per stay instead of two (arrival and departure)
              dots.push(dot)
            
//            year = pathData['Date'].split(', ')[1]
//            if (!pointTickDates[city1].includes(year)) {
//                label = {
//                    lat: pathData['Latitude'] / 1,
//                    lng: pathData['Longitude'] / 1 + LABEL_LNG_SHIFT,
//                    altitude: pathData['Altitude'] / (totalDays * 10/4),
//                    type: 'year', // city or year
//                    text: year,
//                    id: null,
//                }
//                labels.push(label)
//                pointTickDates[city1].push(year)
//            }
            
        }
        
        for (var i=0; i<points.length; i++) {
            var point = points[i]
            var city = point.city
            var stays = pointLabelsDictList[city]
//            var label = `<div class="point tooltip"><span class="label header">${city}</span><br><span data-name="tooltip-dates" class="tooltip-opt selected">Dates</span> · <span data-name="tooltip-venues" class="tooltip-opt">Venues</span> · <span data-name="tooltip-repertory" class="tooltip-opt">Repertory</span> · <span data-name="tooltip-beta" class="tooltip-opt">Beta</span><br>`
            var label = `<div class="point tooltip"><span class="label header">${city}</span><br><span data-name="tooltip-dates" class="tooltip-opt selected">Dates</span> · <span data-name="tooltip-venues" class="tooltip-opt">Venues</span> · <span data-name="tooltip-beta" class="tooltip-opt">Performances</span><br>`
            label += `<div id="tooltip-dates" class="parent selected">`
            for (var j=stays.length-1; j>=0; j--) {
                var stay = stays[j]
                var date1 = stay[0]
                var date2 = stay[1]
                const condensedDate = condenseDates(date1, date2)
//                if (date1 == date2)
//                    label += `<span class="label row" id=${date1.replace(/ /g, '').replace(',', '-')}>· On ${date1}</span><br>`
//                else
//                    label += `<span class="label row" id=${date1.replace(/ /g, '').replace(',', '-')}>· From ${date1} to ${date2}</span><br>`
                label += `<span class="label row" id=${date1.replace(/ /g, '').replace(',', '-')}>${condensedDate}</span>`
            }
            label += `</div><div id="tooltip-venues" class="parent">`
//            point.name = label
//            labels[pointAndLabelIdDict[point.city]*2].name = label
//            labels[pointAndLabelIdDict[point.city]*2+1].name = label
            
            const venuesRepInfo = venues[city]
            const venuesList = venuesRepInfo['Venues'].split('; ').filter(x => x.length)
            for (var i1=0; i1<venuesList.length; i1++)
              label += `<span class="label row">${venuesList[i1]}</span>`
//            label += `</div><div id="tooltip-repertory" class="parent">`
//            const repList = venuesRepInfo['Repertory'].split('; ').filter(x => x.length)
//            for (var i2=0; i2<repList.length; i2++)
//              label += `<span class="label row">${repList[i2]}</span>`
            label += `</div><div id="tooltip-beta" class="parent">`
            
            //const cityInfoBeta = nestedVenuesData[city] // old
            const cityInfoBeta = object2array(nestedVenuesData[city]).reverse() // new
            //for (var k in cityInfoBeta) { // old
            cityInfoBeta.forEach((arr) => { // new
              //var dateBeta = k // old
              //var infoBeta = cityInfoBeta[k] // old
              var dateBeta = arr[0] // new
              var infoBeta = arr[1] // new
              label += `<div>` // new
              label += `<span class="label row date-beta">${dateBeta}</span>`
              var venuesListBeta = infoBeta['Venues'].split('; ').filter(x => x.length)
              for (var i3=0; i3<venuesListBeta.length; i3++)
                label += `<span class="label row venues-beta">  ${venuesListBeta[i3]}</span>`
              var repListBeta = infoBeta['Repertory'].split('; ').filter(x => x.length)
              for (var i4=0; i4<repListBeta.length; i4++)
                label += `<span class="label row repertory-beta">  ${repListBeta[i4]}</span>`
            //} // old
              label += `</div>` // new
            }) // new
            label += `</div></div>`
            point.name = label
        }
        
        // pathsData
        var colorAttr = 'Hexcode4'
        for (var i=0; i<paths.length; i++) {
            paths[i].id = i
            paths[i].name   = pathColorsData[i][colorAttr] == 'grey' ? pathLabels[i].replace(' on ', ' around ') : pathLabels[i]
            paths[i].color  = pathColorsData[i][colorAttr]
            paths[i].color1 = pathColorsData[i].Hexcode1
            paths[i].color2 = pathColorsData[i].Hexcode2
            paths[i].color3 = pathColorsData[i].Hexcode3
            paths[i].color4 = pathColorsData[i].Hexcode4
            paths[i].color5 = pathColorsData[i].Hexcode5
            paths[i].color6 = pathColorsData[i].Hexcode6
            paths[i].color7 = pathColorsData[i].Hexcode7
            paths[i].color8 = pathColorsData[i].Hexcode8
              // pathsData
            paths[i].src = pathCities[i].src // filtering paths by source, destination, and date
            paths[i].dst = pathCities[i].dst // filtering paths by source, destination, and date
            paths[i].date = pathDates[i]     // filtering paths by source, destination, and date
//            paths[i].action = pathActions[i]
        }
        
        pointsD = points
        //labelsD = labels
        pathsD = paths // pathsData
        //paths2D = paths2
        dotsD = dots
        
        myPathsData = paths
    }
    
    function loadData() {
      globe
      .pointsData(pointsD)
      //.labelsData(labelsD)
      .pathsData(pathsD) // pathsData - no lines by default - shift + L to show/hide
      //.paths2Data(paths2D)
      .customLayerData(dotsD)
      
      allSpheres = globe.customLayerData()
    }
    
    function drawInit() {
      var ALT0 = 0.01
      globe
      .pointColor(d => d.type == 'thinPole' ? params.point.color : params.point2.color)
      .pointRadius(d => d.type == 'thinPole' ? params.point.radius : params.point2.radius)
      .pointAltitude(0)
      
      .pathColor(params.path.color)
      //.pathStroke(() => params.path.stroke)
      .pathStroke(0)
      .pathPointAlt(ALT0)
      
      .customThreeObject(d => {
        //var color = d.type == 'sphere' ? params.dot.sphereColor : params.dot.tickColor
        var color = d.type == 'sphere' ? d.color : params.dot.tickColor
        var radius = d.type == 'sphere' ? params.dot.sphereRadius : params.dot.tickRadius
        return new THREE.Mesh(
          new THREE.SphereBufferGeometry(radius, 20, 20),
          new THREE.MeshLambertMaterial({ color: color })
        )
      })
      .customThreeObjectUpdate((obj, d) => {
        Object.assign(obj.position, globe.getCoords(d.lat, d.lng, 0)) // d.alt -> 0
        obj.material.originalColor = obj.material.color
      })
      
      var duration = 1000
      globe
      .pointsTransitionDuration(duration)
      //.labelsTransitionDuration(duration)
      .pathTransitionDuration(duration * 1.2) // pathsData
      //.path2TransitionDuration(duration)
      
      STATUS = 0
      COLOR = true
    }
    
    function drawDefault() {
      globe
      .pointAltitude('altitude')
      //.labelAltitude('altitude')
      //.pathPointAlt(d => d[2])
      //.path2PointAlt(d => d[2])
      .customThreeObject(d => {
      })
      .customThreeObjectUpdate((obj, d) => {
        Object.assign(obj.position, globe.getCoords(d.lat, d.lng, d.alt)) // d.alt -> 0
      })
      
      STATUS = 1
    }
    
    function drawTransitionToDefault() {
      //setTimeout(() => {
        drawDefault()
      //}, 5000);
    }
    
    function drawDefault2() {
      globe
      //.pathStroke(0)
      for (var i=0; i<10; i++) {
          setTimeout(() => {
            globe
            .customThreeObject(d => {
            })
            .customThreeObjectUpdate((obj, d) => {
              obj.scale.setScalar(i+1)
            })
          }, i * 100)
          
      }
      
      STATUS = 2
    }
    
    function drawTransitionToDefault2() {
      //setTimeout(() => {
        drawDefault2()
      //}, 10000);
      setTimeout(() => {
        globe.pathsData([])
      }, 5000);
    }
    
    var timestart
    function foo(timestamp) {
      if (!timestart)
        timestart = timestamp
      const progress = (timestamp - timestart) / 1000
      
      if (progress <= 1) {
        globe
        //.pathPointAlt(d => d[2] * progress) // pathsData
        .customThreeObject(d => {
        })
        .customThreeObjectUpdate((obj, d) => {
          Object.assign(obj.position, globe.getCoords(d.lat, d.lng, d.alt * progress))
          obj.scale.setScalar(11)
        })
        requestAnimationFrame(foo)
      }
      else {
        globe
        //.pathPointAlt(d => d[2]) // pathsData
        .customThreeObject(d => {
        })
        .customThreeObjectUpdate((obj, d) => {
          Object.assign(obj.position, globe.getCoords(d.lat, d.lng, d.alt * 1))
          obj.scale.setScalar(11)
        })
        // Camera distance
        controls.minDistance = 330 // min altitude = 2.3
        //controls.maxDistance = 1500 // max altitude = 14
        controls.maxDistance = 4000 // max altitude = 20
      }
    }
    
    function drawDefault3() {
      requestAnimationFrame(foo)
    }
    
    function drawTransitionToDefault3() {
      $('.scene-tooltip').insertAfter('#globe-container');
      globe
      .pathPointAlt(d => d[2]) // pathsData
      .pointAltitude('altitude')
      drawDefault3()
    }
    
//    setTimeout(() => {
//      drawTransitionToDefault3()
//    }, 5000)
    
    function prepareHighlightableData() {
        var poles = globe.pointsData()
        poles.forEach(d => cityPole[d.city] = d)
        var dots = globe.customLayerData()
        dots.forEach(d => {
          if (d.type == 'sphere') {
            if (!(d.city in citySpheres))
              citySpheres[d.city] = []
            citySpheres[d.city].push(d)
          }
        })
        //globe.customThreeObject(d => {}).customThreeObjectUpdate((obj, d) => { console.log(obj.id, d.city) })
    }
    
    function colorPathsAndDotsAux(attr) {
        globe.pathTransitionDuration(0)
        if (STATUS < 2)
            globe.pathColor(attr)
        globe
        .customThreeObject(d => {
        })
        .customThreeObjectUpdate((obj, d) => {
          if (d.type == 'sphere') {
            obj.material.color = hex2rgbNorm(d[attr])
          }
        })
    }
    
    function colorPathsAndDots(attr) {
        colorPathsAndDotsAux(attr)
    }
    
    document.body.onkeydown = function(ev) {
        // https://keycode.info/
        if (false) {}
//        else if (ev.keyCode == 78 && !ev.ctrlKey && STATUS == 0) { // N
//            ev.preventDefault()
//            drawTransitionToDefault()
//        }
//        else if (ev.keyCode == 78 && !ev.ctrlKey && STATUS == 1) { // N
//            ev.preventDefault()
//            drawTransitionToDefault2()
//        }
//        else if (ev.keyCode == 78 && !ev.ctrlKey) { // N
//            ev.preventDefault()
//            drawTransitionToDefault3()
//        }
        else if (ev.keyCode == 49 && ev.ctrlKey) { // 1
            ev.preventDefault()
            colorPathsAndDots('color1')
        }
        else if (ev.keyCode == 50 && ev.ctrlKey) { // 2
            ev.preventDefault()
            colorPathsAndDots('color2')
        }
        else if (ev.keyCode == 51 && ev.ctrlKey) { // 3
            ev.preventDefault()
            colorPathsAndDots('color3')
        }
        else if (ev.keyCode == 52 && ev.ctrlKey) { // 4
            ev.preventDefault()
            colorPathsAndDots('color4')
        }
        else if (ev.keyCode == 53 && ev.ctrlKey) { // 5
            ev.preventDefault()
            colorPathsAndDots('color5')
        }
        else if (ev.keyCode == 54 && ev.ctrlKey) { // 6
            ev.preventDefault()
            colorPathsAndDots('color6')
        }
        else if (ev.keyCode == 55 && ev.ctrlKey) { // 7
            ev.preventDefault()
            colorPathsAndDots('color7')
        }
        else if (ev.keyCode == 56 && ev.ctrlKey) { // 8
            ev.preventDefault()
            colorPathsAndDots('color8')
        }
        else if (ev.keyCode == 57 && ev.ctrlKey) { // 9
            ev.preventDefault()
            hardResetGlobe(initLoc, 1000, 'transition-translate-1')
        }
        
        
//        else if (ev.keyCode == 66 && !ev.ctrlKey) { // B
//            ev.preventDefault()
//            var selection1 = 'backgroundColor' + STATUS_BACKGROUNDCOLOR
//            var selection2 = params.globe[selection1]
//            scene.background = new THREE.Color(selection2)
//            //document.body.style.backgroundColor = selection2
//            STATUS_BACKGROUNDCOLOR = (STATUS_BACKGROUNDCOLOR + 1) % 2
//            
//            if (scene.children.length >= 2) {
//                var myLight = scene.children[1]
//                myLight.intensity = params.light.aIntensity
//            }
//        }
        else if (ev.code == 'KeyL' && ev.shiftKey) { // L
            //ev.preventDefault()
            globe.pathsData(globe.pathsData().length ? [] : myPathsData)
        }
        else if (ev.code == 'Space') { // SPACE
          //ev.preventDefault()
          if (playTour) {
            if (!window._tweenPaused) {
              pauseTweens()
              clearTimeout(justProgressTimer1)
              clearTimeout(justProgressTimer2)
              clearTimeout(unhighlightTimer)
              clearTimeout(highlightTimer)
              clearTimeout(nextTimer)
              clearTimeout(tourTimeout)
              
              const computedStyle = getComputedStyle(myTooltip2)
              const visibility = computedStyle.visibility
              const opacity = computedStyle.opacity
              myTooltip2.style.transition = 'none'
              myTooltip2.style.opacity = opacity
            }
            else {
              translateY(globalTour.translateY, globalTour.TIMELEFT * 0.75)
              translateX(globalTour.translateX, globalTour.TIMELEFT * 0.75)
              resumeTweens()
//              runTours(tours, globalTour.i, globalTour.j, globalTour.deltaPaused)
              runTours(tours, globalTour.i, globalTour.j, globalTour.TIMEPASSEDBY)
              globalTour.deltaPaused = 0
              globalTour.deltaResumed = 0//[]
              
              myTooltip2.style.transition = ''
              myTooltip2.style.opacity = ''
              const wasInvisible = myTooltip2.classList.contains('invisible');
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  if (wasInvisible) {
                    myTooltip2.classList.add('invisible');
                  }
                });
              });
            }
          }
        }
        else if (ev.code == 'Escape') { // Escape
          ev.preventDefault()
          byeWelcome(true)
          endTour()
        }
        else if (ev.code == 'ArrowRight') { // arrow right // right arrow ->
          //ev.preventDefault()
          if (!window._tweenPaused) {
            if (playTour) {
              const p = globalTour.progress
              const addI = p == 0 || p >= 3 ? 1 : 0
              const nextI = globalTour.i + addI
              globalTour.i = nextI
              stopTourQuick()
              goTour(nextI)
            }
            else {
              tours = tours || tours1
              playPauseIconMousedown(true)
              $('#dropdownmenu-tour .dropdown-content').css('display', 'none')
            }
          }
        }
        else if (ev.code == 'ArrowLeft') { // arrow left // left arrow <-
          //ev.preventDefault()
          if (!window._tweenPaused) {
            if (playTour) {
              const p = globalTour.progress
              const addI = p == 0 || p >= 2 ? 1 : 2
              const nextI = Math.max(0, globalTour.i - addI)
              globalTour.i = nextI
              stopTourQuick()
              goTour(nextI)
            }
          }
        }
        else if (ev.code == 'ArrowUp') { // arrow up // down up ->
          //ev.preventDefault()
          if (!window._tweenPaused) {
            if (playTour) {
              stopTour()
            }
            tours = tours || tours1
            playPauseIconMousedown(true)
            $('#dropdownmenu-tour .dropdown-content').css('display', 'none')
          }
        }
        else if (ev.code == 'ArrowDown') { // arrow down // down arrow ->
          //ev.preventDefault()
          endTour()
        }
        //console.log(ev, String.fromCharCode(ev.keyCode)+" --> "+ev.keyCode);
        // https://keycode.info/
    };
    
    function goTour(nextI) {
      tours = tours || tours1
      playPauseIconMousedown(true, false)
      $('#dropdownmenu-tour .dropdown-content').css('display', 'none')
      
      if (playTour && !endingTour) {
        if (nextI < tours.length) {
          const { goto, dates, altitude, translateY, alt, text, translateX } = tours[nextI][0]
          const { lat, lng } = goto ? cityPole[goto] : alt ? alt : globe.pointOfView()
          const latShift = goto ? 20 : 0
          const loc = {lat: lat - latShift, lng: lng, altitude: altitude}
          
          const spheres = allSpheres.filter(x =>
            (new Date(`${dates[0]}T00:00:00`)) <= (new Date(x.date)) &&
            (new Date(x.date)) <= (new Date(`${dates[1]}T00:00:00`))
          )
          const cities = spheres.map(x => x.city)
          const poles = cities.map(x => cityPole[x])
          const paths = myPathsData.filter(x =>
            cities.includes(x.src) &&
            cities.includes(x.dst) &&
            (new Date(`${dates[0]}T00:00:00`)) <= (new Date(x.date)) &&
            (new Date(x.date)) <= (new Date(`${dates[1]}T00:00:00`))
          )
          
          disableAllPoleSpheresPaths()
          
          poles.forEach(d => {
            highlightPoleAndSpheres(d, poles)
            // addToSelection(d) // HIDE TO PREVENT DISPLAYING TOOLTIP AFTER ENDING TOUR
          })
          paths.forEach(d => {
            showPath(d, 3 / altitude)
            addToPaths(d)
          })
          $('#side-panel-2').html(text)
          $('#my-tooltip-2').html(text)
          $('#side-panel-2').removeClass('invisible')
          $('#my-tooltip-2').removeClass('invisible')
          
          myTooltip2.style.transition = 'none'
          myTooltip2.offsetHeight
          
          window.TWEEN.getAll().forEach(t => { t.stop(); t.end() })
          cancelAnimationFrame(translateYAnimationFrameId)
          cancelAnimationFrame(translateXAnimationFrameId)
          clearTimeout(justProgressTimer1)
          clearTimeout(justProgressTimer2)
          clearTimeout(unhighlightTimer)
          clearTimeout(highlightTimer)
          clearTimeout(nextTimer)
          clearTimeout(tourTimeout)
          globalTour.TIMEPASSEDBY = globalTour.TRAVELTIME - 0.001
          globalTour.TIMELEFT = globalTour.TRAVELTIME - globalTour.TIMEPASSEDBY
          
          //goTo(loc, translateY, globalTour.TIMELEFT, 'tour')
          globalTour.translateY = translateY
          controls.target.y = globalTour.translateY
          globalTour.translateX = translateX ? translateX : 0
          controls.target.x = globalTour.translateX
          globe.pointOfView(loc)//, globalTour.TIMELEFT, null, 'cubic')
          myTooltip2.style.transition = ''
          myTooltip2.offsetHeight
          tourTimeout = setTimeout(() => {
            runTours(tours, nextI, 0, globalTour.TIMEPASSEDBY)
          }, 500)
        }
        else
          endTour()
      }
    }
    
    window.addEventListener("scroll", function(ev){
        //console.log('Scroll is happening...')
    });
    
    window.addEventListener("resize", function(ev){
        //console.log('Resize is happening...')
    });
    
    
    // SEARCH
    
    const stateAbbrev = Object.fromEntries(
      abbrevData.map(({ State, Abbreviation }) => [ Abbreviation, State ])
    )
    
    function buildSearchBar() {
      var searchBar = document.getElementById('searchBar')
      $('#searchBar').show()
      
      var elems = unpack(pointsData, 'City')
      elems.sort()
      
      var ul = document.getElementById('searchUL')
      ul.classList.add('ulPerformers')
      elems.forEach(function (x) {
        let li = document.createElement('li')
        //li.id = x[0]
        li.id = x
        li.classList.add('liPerformer')
        li.style.display = 'none'
        ul.appendChild(li)
        //li.innerHTML = '<a href="#" id="'+formatId(x)+'">'+x+'</a>'
        //li.innerHTML = x[1]
        li.innerHTML = x
        var alt = x
        if (alt.endsWith('USA')) {
          for (var k in stateAbbrev)
            alt = alt.replace(`, ${k}, USA`, `, ${stateAbbrev[k]}, USA`)
        }
        li.setAttribute('data-alt', alt)
        li.addEventListener('mouseover', function(ev) {
          ev.preventDefault()
          const city = ev.target.id
          const d = cityPole[city]
          hoverOnPole(d)
          
          $('#searchInput').blur()
        })
        li.addEventListener('mouseout', function(ev) {
          ev.preventDefault()
          const city = ev.target.id
          const d = cityPole[city]
          unhoverOnPole(d)
        })
        li.addEventListener('mousedown', function(ev) {
          ev.preventDefault()
          
          const city = ev.target.id
          const pole = cityPole[city]
          
          ctrlKey = ev.ctrlKey
          if (ctrlKey)
            clickOnPole(pole)
          else {
            const lat = pole.lat
            const lng = pole.lng
            const loc = {lat: lat - 20, lng: lng, altitude: 3}
            //goTo(loc, 2/3, searchTravelTime, 'search')
            goTo(loc, 50, searchTravelTime, 'search')
            setTimeout(() => {
              clickOnPole(pole, true)
            }, 1000)
          }
          
          $('#searchInput').blur()
        })
      })
      document.getElementById('searchInput').value = ''
      document.getElementById('searchCloseButton').addEventListener('click', function(ev) {
        closeSearch(ev)
      })
      searchBar.addEventListener('keyup', searchPerformer)
      document.getElementById('searchInput').addEventListener('focusin', (ev) => {
    //      $('#searchCloseButton').css('opacity', 0.9)
        $('#searchCloseButton').addClass('active')
        $('#searchInput').addClass('active')
      })
      document.getElementById('searchInput').addEventListener('mouseover', (ev) => {
        //clearTimeout(unhighlightTimeout)
        // it necessary both solutions in combination to stop the unhighlight
      })
      document.getElementById('searchInputAndCloseButton').addEventListener('mouseleave', (ev) => {
        if ($('#searchUL li.liPerformer:visible').length == 0) {
          closeSearch2()
        }
      })
      $('div.searchResults').on('mouseleave', (ev) => {
      })
      $('div.searchResults').on('mouseover', (ev) => {
      })
    }
    buildSearchBar()
    
    function closeSearch(ev) {
      ev.preventDefault()
      return closeSearch2()
    }
    
    closeSearch2 = function() {
      document.getElementById('searchInput').value = ''
  //    $('#searchCloseButton').css('opacity', 0)
      $('#searchCloseButton').removeClass('active')
      $('#searchInput').removeClass('active')
      $('#searchUL li.liPerformer').hide()
      $('div.searchResults').hide()
      
      $('#searchInput').blur()
      
      SELECTIONON = false
      $('li.liPerformer').removeClass('selected')
      
      return false
    }
    
    function searchPerformer(ev) {
      $('div.searchResults').removeClass('svg')
      
      ev.preventDefault()
      // Declare variables
      var input, filter, ul, li, a, i, txtValue;
      input = document.getElementById('searchInput');
      filter = input.value.toUpperCase();
      
      if (filter.length > 0) {
        $('div.searchResults').show()
        ul = document.getElementById('searchUL');
        li = ul.getElementsByTagName('li');
        
        var counter = 0
        // Loop through all list items, and hide those who don't match the search query
        for (i = 0; i < li.length; i++) {
          a = li[i]//.getElementsByTagName("a")[0];
          txtValue = a.textContent || a.innerText;
          txtValue2 = a.getAttribute('data-alt')
          if (txtValue.toUpperCase().indexOf(filter) == 0 || txtValue.toUpperCase().indexOf(', '+filter) > -1 || txtValue2.toUpperCase().indexOf(filter) == 0 || txtValue2.toUpperCase().indexOf(', '+filter) > -1) {
            li[i].style.display = "";
            counter ++;
          } else {
            li[i].style.display = "none";
          }
        }
        if (counter) {
          $('#noResults').hide()
        }
        else {
          $('#noResults').show()
        }
      }
      else {
        //$('#searchCloseButton').hide()
        $('#searchUL li.liPerformer').hide()
        $('div.searchResults').hide()
      }
    }
}



// Utils
function euclideanDistance(a) {
  p1 = a[0]
  p2 = a[1]
  xdiff = Math.pow((p1[0] - p2[0]), 2)
  ydiff = Math.pow((p1[1] - p2[1]), 2)
  zdiff = Math.pow((p1[2] - p2[2]), 2)
  return Math.sqrt( xdiff + ydiff + zdiff)
}

function unpack(rows, key) {
  return rows.map(function(row) { return row[key]; });
}

function randomLoc() {
    var absX = Math.random() * 100
    var sigX = Math.random() >= 0.5 ? 1 : -1
    var x = sigX * absX
    var absY = Math.random() * 100
    var sigY = Math.random() >= 0.5 ? 1 : -1
    var y = sigY * absY
    var z = Math.random() * 4 + 2
    var goto = {
        lat: x,
        lng: y,
        altitude: z,
    }
    return goto
}

function hexa2hexAndAlpha(hexa) {
    if (hexa.length == 7)
        hexa = hexa + 'FF'
    var hex = hexa.slice(0, hexa.length-2)
    var alpha = +('0x' + hexa.slice(-2)) / 255
    return [hex, alpha]
}
function hex2rgbNorm(h) {
  var r, g, b
  r = +("0x" + h[1] + h[2]) / 255
  g = +("0x" + h[3] + h[4]) / 255
  b = +("0x" + h[5] + h[6]) / 255
  return {r: r, g: g, b: b}
}

function removeElement(a, e) {
    var i = a.indexOf(e)
    a.splice(i, 1)
}

function straightlineEquation(x1, y1, x2, y2, x) {
    y = ((y2 - y1) / (x2 - x1)) * (x - x1) + y1
    return y
}

function condenseDates(str1, str2) {
  var r;
  if (str1 == str2)
    r = str1
  else {
    const date1 = new Date(str1)
    const d1 = date1.getDate()
    const m1 = str1.slice(0, 3)
    const y1 = date1.getFullYear()
    const date2 = new Date(str2)
    const d2 = date2.getDate()
    const m2 = str2.slice(0, 3)
    const y2 = date2.getFullYear()
    if (y1 == y2) {
      if (m1 == m2) {
        r = m1 + ' ' + d1 + '-' + d2 + ', ' + y1
        if (d1 == d2)
          FAIL
      }
      else
        r = m1 + ' ' + d1 + ' - ' + m2 + ' ' + d2 + ', ' + y1
    }
    else
      r = str1 + ' - ' + str2
  }
  r = r.replace('Jan', 'Jan.').replace('Feb', 'Feb.').replace('Mar', 'Mar.').replace('Apr', 'Apr.').replace('Jun', 'Jun.').replace('Jul', 'Jul.').replace('Aug', 'Aug.').replace('Sep', 'Sep.').replace('Oct', 'Oct.').replace('Nov', 'Nov.').replace('Dec', 'Dec.')
  return r
}

function equalDates(d1, d2) {
  return d1.getTime() === d2.getTime();
}

const object2array = obj => Object.keys(obj).map((key) => [key, obj[key]])

var resizeTimer

let updateCount = 0;

function updateLayout() {
  mainRect = document.getElementById('main-content').getBoundingClientRect()
  INIT_WIDTH = mainRect.width // 1280
  INIT_HEIGHT = mainRect.height // 720

  RECT_SIZE = Math.min(INIT_WIDTH, INIT_HEIGHT);
  
  WIDTH =  RECT_SIZE * 3//(RECT_SIZE < SIZE_THRESHOLD ? 2 : 3)
  HEIGHT =  RECT_SIZE * 3//(RECT_SIZE < SIZE_THRESHOLD ? 2 : 3)
  globe.width(WIDTH).height(HEIGHT)
  
  veryOriginalX = -(WIDTH - INIT_WIDTH) / 2
  veryOriginalY = -(HEIGHT - INIT_HEIGHT) / 2
  originalX = veryOriginalX, originalY = veryOriginalY
  $(globeDiv).css('translate', `${veryOriginalX}px ${veryOriginalY}px`)
}

function delayedUpdateLayout() {
//  cancelAnimationFrame(layoutTimer);
  
  layoutTimer = requestAnimationFrame(() => {
    layoutTimer = requestAnimationFrame(updateLayout);
  });
}


//window.addEventListener('orientationchange', () => {
////  delayedUpdateLayout()
//  
////  setTimeout(updateLayout, 300);
//});

const mainContent = document.getElementById('main-content');
const layoutObserver = new ResizeObserver(() => {
  delayedUpdateLayout();
});
layoutObserver.observe(mainContent);

window.addEventListener('resize', function() {
//  const today = new Date()
//  const currentTime = today.toLocaleTimeString()
//  document.getElementById('test').innerHTML='1 --- ' + currentTime

  delayedUpdateLayout()
  
//  clearTimeout(resizeTimer);
//  resizeTimer = setTimeout(updateLayout, 150);
  
//  mainRect = document.getElementById('main-content').getBoundingClientRect()
//  INIT_WIDTH = mainRect.width // 1280
//  INIT_HEIGHT = mainRect.height // 720
//  
//  WIDTH =  INIT_HEIGHT * 3
//  HEIGHT =  INIT_HEIGHT * 3
//  globe.width(WIDTH).height(HEIGHT)
//  
//  veryOriginalX = -(WIDTH - INIT_WIDTH) / 2
//  veryOriginalY = -(HEIGHT - INIT_HEIGHT) / 2
//  originalX = veryOriginalX, originalY = veryOriginalY
//  $(globeDiv).css('translate', `${veryOriginalX}px ${veryOriginalY}px`)
//  
//  
////  clearTimeout(resizeTimer)
////  resizeTimer = setTimeout(() => {
//////    mainRect = document.getElementById('main-content').getBoundingClientRect()
//////    INIT_WIDTH = mainRect.width // 1280
//////    INIT_HEIGHT = mainRect.height // 720
////    WIDTH =  INIT_HEIGHT * 3
////    HEIGHT =  INIT_HEIGHT * 3
////    globe.width(WIDTH).height(HEIGHT)
////    veryOriginalX = -(WIDTH - INIT_WIDTH) / 2
////    veryOriginalY = -(HEIGHT - INIT_HEIGHT) / 2
////    originalX = veryOriginalX, originalY = veryOriginalY
////    $(globeDiv).css('translate', `${veryOriginalX}px ${veryOriginalY}px`)
////  }, 500)
})


////////////////
//            //
// DRAG GLOBE //
//            //
////////////////

// veryOriginal is the inital value after loading or after resizing
// original is the value before dragging

var veryOriginalX = -(WIDTH - INIT_WIDTH) / 2
var veryOriginalY = -(HEIGHT - INIT_HEIGHT) / 2
var allowDrag, lastX, lastY, originalX = veryOriginalX, originalY = veryOriginalY
var draggingHappened = false
var fix_tooltip = false
globeDiv.addEventListener('mousedown', ev => {
  ev.preventDefault()
  if (ev.button == 2) { // right click
    allowDrag = true
    lastX = ev.clientX - originalX
    lastY = ev.clientY - originalY
  }
  
  // Tooltips
//  $('#my-tooltip').html('')
//  fix_tooltip = false
//  if (currentHighlightedPole) {
//    unhighlightPole(currentHighlightedPole)
//    unhighlightSpheres(currentHighlightedPole)
//    //currentHighlightedPole = null
//  }
})
globeDiv.addEventListener('mousemove', ev => {
  ev.preventDefault()
  if (allowDrag) {
    const diffX = ev.clientX - lastX
    const diffY = ev.clientY - lastY
//    $(globeDiv).css('transform', `translate(${diffX}px, ${diffY}px)`)
    $(globeDiv).css('translate', `${diffX}px ${diffY}px`)
    draggingHappened = true
  }
})
globeDiv.addEventListener('mouseup', ev => {
  ev.preventDefault()
  if (ev.button == 2 && allowDrag) { // right click and allow drag
    allowDrag = false
    originalX = ev.clientX - lastX
    originalY = ev.clientY - lastY
  }
})
globeDiv.addEventListener('mouseout', ev => {
  ev.preventDefault()
  if (allowDrag) { // allow drag
    allowDrag = false
    originalX = ev.clientX - lastX
    originalY = ev.clientY - lastY
  }
})
globeDiv.addEventListener('mouseover', ev => {
  ev.preventDefault()
  if (ev.buttons == 2) { // right button pressed
    allowDrag = true
    lastX = ev.clientX - originalX
    lastY = ev.clientY - originalY
  }
})


// Other globe events
var leftClick = false
var ctrlKey = false

globeDiv.addEventListener('dblclick', function(ev) {
//  var currentAlt = globe.pointOfView().altitude
//  if (currentAlt < 3)
//      globe.pointOfView({altitude: 5}, jumpTransition)
//  else
//      globe.pointOfView({altitude: 1}, jumpTransition)
//  // if (globe.pointOfView().altitude < 9) TRUE
//  $('#description').removeClass('visible')
})

globeDiv.addEventListener('mousedown', function(ev) {
  if (ev.button == 0) {
    leftClick = true
  }
  if (ev.ctrlKey) {
    ctrlKey = true
  }
})

globeDiv.addEventListener('mouseup', function(ev) {
  if (ev.button == 2 && !draggingHappened) {
    if (!playTour) {
      clearSelection()
      hideTooltip()
      clearTour()
    }
  }
  draggingHappened = false
  leftClick = false
  ctrlKey = false
})

//globeDiv.addEventListener('touchstart', () => {
//  leftClick = true;
//});
//globeDiv.addEventListener('touchmove', () => {
//  leftClick = false;
//});
//globeDiv.addEventListener('touchend', (ev) => {
//  leftClick = false;
//});

function globeInMotion() {
  return globeInMotion2() || PLAYWELCOME
}

function globeInMotion2() {
  return playTour || $('#globeViz').hasClass('transition-translate-search') || endingTour
}

// Highlighting functions
var cityPole = {}
var citySpheres = {}
var currentHighlightedPole = null
var selectedPoles = []
var tourPaths = new Set()

function highlightPoleAndSpheres(pole, others) {
  if (playTour)
    disableAllPolesAndSpheresExcept(pole, others)
  highlightPole(pole)
  highlightSpheres(pole)
  boldSearchResult(pole)
}

function unhighlightPoleAndSpheres(pole) {
  unhighlightPole(pole)
  unhighlightSpheres(pole)
  normalSearchResult(pole)
//  enableAllPolesAndSpheres() // calling this function here will wrongly unhighlight a pole when going from a pole to one of its spheres or viceversa
}

function disableAllPolesAndSpheresExcept(pole, others) {
  var spheres = citySpheres[pole.city]
  if (others) {
    others.forEach(p => {
      aux = citySpheres[p.city]
      spheres = spheres.concat(aux)
    })
  }
  globe
  .pointColor(d => d == pole || others.includes(d) ? params.point.color : d.type == 'thinPole' ? '#0002' : params.point2.color)
  //.pointRadius(d => d == pole || others.includes(d) ? params.point.radius : d.type == 'thinPole' ? params.point.radius : params.point2.radius)
  .customThreeObject(d => {
  })
  .customThreeObjectUpdate((obj, d) => {
    if (!spheres.includes(d)) {
      //obj.scale.setScalar(6)
      obj.material.color = {r: 0.8, g: 0.8, b: 0.8}
    }
    else {
      //obj.scale.setScalar(11)
      obj.material.color = obj.material.originalColor
    }
  })
}

function disableAllPoleSpheresPaths() {
  globe
  .pointColor(d => d.type == 'thinPole' ? '#0002' : params.point2.color)
  //.pointRadius(d => d.type == 'thinPole' ? params.point.radius : params.point2.radius)
  .customThreeObject(d => {
  })
  .customThreeObjectUpdate((obj, d) => {
    //obj.scale.setScalar(6)
    obj.material.color = {r: 0.8, g: 0.8, b: 0.8}
  })
  clearPaths()
}

function enableAllPolesAndSpheres() {
  globe
  .pointColor(d => d.type == 'thinPole' ? params.point.color : params.point2.color) // it resets points' radius !!!
  //.pointRadius(d => d.type == 'thinPole' ? params.point.radius : params.point2.radius)
  .customThreeObject(d => {
  })
  .customThreeObjectUpdate((obj, d) => {
    //obj.scale.setScalar(11)
    obj.material.color = obj.material.originalColor
  })
}

function setPathWidth(path, w) {
  path.__threeObj.material.linewidth = w
}

function showPath(path, width=0.6) {
  setPathWidth(path, width)
}

function hidePath(path) {
  setPathWidth(path, 0)
}

function addToPaths(path) {
  tourPaths.add(path)
}

function clearPaths() {
  tourPaths.forEach(d => hidePath(d))
  tourPaths.clear()
}

function clearTour() {
  clearSelection()
  clearPaths()
  enableAllPolesAndSpheres()
}

function endTour2() {
  const timer = 500
  
  globalTour.i = 0
  globalTour.j = 0
  globalTour.progress = 0
  globalTour.TIMEPASSEDBY = 0
  globalTour.TIMELEFT = globalTour.TRAVELTIME - globalTour.TIMEPASSEDBY
  
  //clearTour() // Done in resetGlobe after delay
  clearTimeout(nextTimer)
  clearTimeout(highlightTimer)
  clearTimeout(unhighlightTimer)
  clearTimeout(justProgressTimer1)
  clearTimeout(justProgressTimer2)
  clearTimeout(tourTimeout)
  cancelAnimationFrame(translateYAnimationFrameId)
  cancelAnimationFrame(translateXAnimationFrameId)
  resetGlobe({altitude: defaultAlt}, timer, 'transition-translate-search', searchTravelTime)
  
  setTimeout(() => {
    $('.leftable').removeClass('left')
    $('#side-panel-2').removeClass('visible invisible').html('')
    $('#my-tooltip-2').removeClass('visible invisible invisible-fast').html('')
    
    //$('#menu-icon').removeClass('inactive')
    $('#reset-icon').removeClass('inactive')
    $('#play-pause-icon').removeClass('inactive')
  }, timer) // enables icons at the same time the globe is reset and not unnecessarily earlier
  $('#my-tooltip-2').addClass('visible invisible invisible-fast')
  $('body').removeClass('active-tour')
  activeTourTimer = setTimeout(() => { $('#side-container').removeClass('active-tour') }, timer)
  
  endingTour = true
  setTimeout(() => { endingTour = false, playTour = false }, timer)
  setTimeout(() => { window.TWEEN.getAll().forEach(t => { t.stop(); t.end() }) }, timer)
}

function endTour() {
  globalTour.i = 0
  globalTour.j = 0
  globalTour.progress = 0
  globalTour.TIMEPASSEDBY = 0
  globalTour.TIMELEFT = globalTour.TRAVELTIME - globalTour.TIMEPASSEDBY
  
  //clearTour() // Done in resetGlobe after delay
  clearTimeout(nextTimer)
  clearTimeout(highlightTimer)
  clearTimeout(unhighlightTimer)
  clearTimeout(justProgressTimer1)
  clearTimeout(justProgressTimer2)
  clearTimeout(tourTimeout)
  cancelAnimationFrame(translateYAnimationFrameId)
  cancelAnimationFrame(translateXAnimationFrameId)
  resetGlobe({altitude: defaultAlt}, searchTravelTime * 2, 'transition-translate-search', searchTravelTime)
  
  setTimeout(() => {
    $('.leftable').removeClass('left')
    $('#side-panel-2').removeClass('visible invisible').html('')
    $('#my-tooltip-2').removeClass('visible invisible invisible-fast').html('')
    
    //$('#menu-icon').removeClass('inactive')
    $('#reset-icon').removeClass('inactive')
    $('#play-pause-icon').removeClass('inactive')
  }, searchTravelTime * 2) // enables icons at the same time the globe is reset and not unnecessarily earlier
  $('#my-tooltip-2').addClass('visible invisible invisible-fast')
  $('body').removeClass('active-tour')
  activeTourTimer = setTimeout(() => { $('#side-container').removeClass('active-tour') }, 2000)
  
  endingTour = true
  setTimeout(() => { endingTour = false, playTour = false }, searchTravelTime * 0.5)
  setTimeout(() => { window.TWEEN.getAll().forEach(t => { t.stop(); t.end() }) }, searchTravelTime * 2)
}

function stopTour() {
  globalTour.i = 0
  globalTour.j = 0
  globalTour.progress = 0
  globalTour.TIMEPASSEDBY = 0
  globalTour.TIMELEFT = globalTour.TRAVELTIME - globalTour.TIMEPASSEDBY
  
  clearTour()
  clearTimeout(nextTimer)
  clearTimeout(highlightTimer)
  clearTimeout(unhighlightTimer)
  clearTimeout(justProgressTimer1)
  clearTimeout(justProgressTimer2)
  clearTimeout(tourTimeout)
  cancelAnimationFrame(translateYAnimationFrameId)
  cancelAnimationFrame(translateXAnimationFrameId)
  window.TWEEN.getAll().forEach(t => { t.stop() })
}

function stopTourQuick() {
//  globalTour.i = 0
  globalTour.j = 0
  globalTour.progress = 0
  globalTour.TIMEPASSEDBY = 0
  globalTour.TIMELEFT = globalTour.TRAVELTIME - globalTour.TIMEPASSEDBY
  
//  clearTour()
  clearTimeout(nextTimer)
  clearTimeout(highlightTimer)
  clearTimeout(unhighlightTimer)
  clearTimeout(justProgressTimer1)
  clearTimeout(justProgressTimer2)
  clearTimeout(tourTimeout)
  cancelAnimationFrame(translateYAnimationFrameId)
  cancelAnimationFrame(translateXAnimationFrameId)
  window.TWEEN.getAll().forEach(t => { t.stop() })
}

function boldSearchResult(d) {
  const city = d.city
  if (city) {
    const li = document.getElementById(city)
    li.classList.remove('noevents')
    li.classList.add('fake-hover')
  }
}

function normalSearchResult(d) {
  const city = d.city
  if (city) {
    const li = document.getElementById(city)
    li.classList.remove('fake-hover')
    li.classList.add('noevents')
  }
}

function clickOnPole(d, force=false) { // force comes search
  
//  if (false) {}
//  else if (!isSelected(d) && !ctrlKey) {
//    clearSelection()
//    highlightPoleAndSpheres(d)
//    addToSelection(d)
//  }
//  else if (!isSelected(d) && ctrlKey) {
//    highlightPoleAndSpheres(d)
//    addToSelection(d)
//  }
//  else if (isSelected(d) && !ctrlKey) {
//    if (isOnlySelected(d)) {
//      unhighlightPoleAndSpheres(d)
//      removeFromSelection(d)
//    }
//    else {
//      clearSelection()
//      highlightPoleAndSpheres(d)
//      addToSelection(d)
//    }
//  }
//  else if (isSelected(d) && ctrlKey) {
//    unhighlightPoleAndSpheres(d)
//    removeFromSelection(d)
//  }
//  else { FAIL }
  
  if (!isSelected(d) || (!ctrlKey && !isOnlySelected(d)) || force) {
    if (!ctrlKey)
      clearSelection()
    addToSelection(d)
    hoverOnPole(d)
    $('#reverse-icon').addClass('visible')
  }
  else if (ctrlKey || isOnlySelected(d)) {
    removeFromSelection(d)
    unhoverOnPole(d, true)
    $('#reverse-icon').removeClass('visible')
  }
}

function clickOnSphere(d) {
  const pole = cityPole[d.city]
  if (pole)
    clickOnPole(pole)
}

function hoverOnPole(d) {
  highlightPoleAndSpheres(d)
  showTooltip(d)
}

function unhoverOnPole(d, force=false) { // force comes from "unclick"
  if (!isSelected(d) || force)
    unhighlightPoleAndSpheres(d)
  hideTooltip()
}

function hoverOnSphere(d) {
  const pole = cityPole[d.city]
  if (pole)
    hoverOnPole(pole)
}

function unhoverOnSphere(d) {
  const pole = cityPole[d.city]
  if (pole)
    unhoverOnPole(pole)
}

function addToSelection(pole) {
  selectedPoles.push(pole)
}

function removeFromSelection(pole) {
  const i = selectedPoles.indexOf(pole)
  selectedPoles.splice(i, 1)
}

function isSelected(pole) {
  return selectedPoles.includes(pole)
}

function isOnlySelected(pole) {
  return selectedPoles.length == 1 && selectedPoles[0] == pole
}

function lastSelectedPole() {
  return selectedPoles.length > 0 ? selectedPoles[selectedPoles.length-1] : null
}

function clearSelection() {
  selectedPoles.forEach(d => unhighlightPoleAndSpheres(d))
  selectedPoles = []
}

function showTooltip(pole) {
  $('#my-tooltip').html(pole.name)
  $('#my-tooltip').addClass('visible')
}

function hideTooltip(force=false) {
  const last = lastSelectedPole()
  if (last && !force) {
    $('#my-tooltip').html(last.name)
    $('#my-tooltip').addClass('visible')
  }
  else {
    $('#my-tooltip').html('')
    $('#my-tooltip').removeClass('visible')
    $('#reverse-icon').removeClass('visible')
  }
}

function highlightPole(d) {
//  d.__threeObj.scale.x = params.point2.radius * 2 // this doesn't make the point2 ('thick') visible, but the opacity in the material below
//  d.__threeObj.scale.y = params.point2.radius * 2 // this doesn't make the point2 ('thick') visible, but the opacity in the material below
  //d.__threeObj.scale.z *= 2
  var poleColor = new THREE.MeshLambertMaterial({
    //color: d.color, //'white', //params.point2.highHexColor, white instead of aqua THIS FOR GRADIENT COLOR BUT IT DOESN'T WORK
    color: params.point2.highHexColor,
    transparent: params.point2.highOpacity < 1,
    opacity: params.point2.highOpacity,
  })
  d.__threeObj.material = poleColor
  d.highlighted = true
}

function unhighlightPole(d) {
  var poleColor = new THREE.MeshLambertMaterial({
    color: params.point2.hexColor,
    transparent: params.point2.opacity < 1,
    opacity: params.point2.opacity,
  })
  d.__threeObj.material = poleColor // it resets points' radius !!!
  d.highlighted = false
  //d.__threeObj.scale.z /= 2
}

function highlightSpheres(d) {
  const spheres = citySpheres[d.city]
  if (spheres)
    spheres.forEach(d => highlightSphere(d))
}

function unhighlightSpheres(d) {
  const spheres = citySpheres[d.city]
  if (spheres)
    spheres.forEach(d => unhighlightSphere(d))
}

function highlightSphere(d) {
//  d.__threeObj.scale.x = 22
//  d.__threeObj.scale.y = 22
//  d.__threeObj.scale.z = 22
//  Object.assign(d.__threeObj.position, globe.getCoords(d.lat, d.lng, d.alt))
  d.__threeObj.scale.setScalar(22)
}

function unhighlightSphere(d) {
//  d.__threeObj.scale.x = 11
//  d.__threeObj.scale.y = 11
//  d.__threeObj.scale.z = 11
//  Object.assign(d.__threeObj.position, globe.getCoords(d.lat, d.lng, d.alt))
  d.__threeObj.scale.setScalar(11)
}



////////////////////////////////
//                            //
// MENU AND DEMO INTERACTIONS //
//                            //
////////////////////////////////

//document.getElementById('menu-icon').addEventListener('mousedown', function(ev) {
//  if (!globeInMotion()) {
////    $('.leftable').toggleClass('left')
////    $('#side-panel').toggleClass('visible')
//  
//    if ($('.leftable').hasClass('left') && $('#side-panel').hasClass('visible')) {
//      $('.leftable').removeClass('left')
//      $('#side-panel').removeClass('visible')
//    }
//    else if (!$('.leftable').hasClass('left') && !$('#side-panel').hasClass('visible')) {
//      $('.leftable').addClass('left')
//      $('#side-panel').addClass('visible')
//    }
//    else {
//      $('.leftable').removeClass('left')
//      $('#side-panel').removeClass('visible')
//    }
//  }
//})

// H's request
document.getElementById('menu-icon').addEventListener('mousedown', function(ev) {
  if (playTour) {
    endTour2()
    setTimeout(() => {
      if ($('.leftable').hasClass('left') && $('#side-panel').hasClass('visible')) {
        $('.leftable').removeClass('left')
        $('#side-panel').removeClass('visible')
      }
      else if (!$('.leftable').hasClass('left') && !$('#side-panel').hasClass('visible')) {
        $('.leftable').addClass('left')
        $('#side-panel').addClass('visible')
      }
      else {
        $('.leftable').removeClass('left')
        $('#side-panel').removeClass('visible')
      }
    }, 600)
  }
  else {
    if ($('.leftable').hasClass('left') && $('#side-panel').hasClass('visible')) {
      $('.leftable').removeClass('left')
      $('#side-panel').removeClass('visible')
    }
    else if (!$('.leftable').hasClass('left') && !$('#side-panel').hasClass('visible')) {
      $('.leftable').addClass('left')
      $('#side-panel').addClass('visible')
    }
    else {
      $('.leftable').removeClass('left')
      $('#side-panel').removeClass('visible')
    }
  }
})

document.getElementById('reset-icon').addEventListener('contextmenu', function(ev) {
  ev.preventDefault()
})
document.getElementById('reset-icon').addEventListener('mousedown', function(ev) {
    ev.preventDefault()
    if (!globeInMotion()) {
      if (ev.button == 0)
        resetGlobe(initLoc, 1000, 'transition-translate-1')
      else
        hardResetGlobe(initLoc, 1000, 'transition-translate-1')
    }
})

document.getElementById('reverse-icon').addEventListener('mousedown', function(ev) {
  $('.parent').toggleClass('reversed')
})

$('#my-tooltip').on('mousedown', '.tooltip-opt', function(ev) {
  $('#my-tooltip .tooltip-opt').removeClass('selected')
  const thisJQ = $(this)
  thisJQ.addClass('selected')
  $('.parent').removeClass('selected')
  $(`#${thisJQ.data('name')}`).addClass('selected')
})


// Sample code for filtering paths by source, destination, and date
//temp0.filter(x =>
//  x.src.includes('Japan') && x.dst.includes('Japan') && ((new Date(x.date)) < (new Date('1970')))
//)

////////////////////////////////////////////////////////////////////////////////
// TOURS
////////////////////////////////////////////////////////////////////////////////

// Save original TWEEN.update
const _originalTweenUpdate = window.TWEEN.update.bind(window.TWEEN);

window._tweenPaused = false;
window._pauseTime = null;


// Override update
window.TWEEN.update = function (...args) {
  if (window._tweenPaused) return true;
  return _originalTweenUpdate(...args);
};

// Pause function
window.pauseTweens = function () {
  if (window._tweenPaused) return;
  window._tweenPaused = true;
  window._pauseTime = performance.now();
  
  const delta = window._pauseTime - globalTour.startTime
//  delta <= tourTravelTime ? 'Ok' : FAIL
//  if (delta > tourTravelTime)
//    console.log(777, delta)
  globalTour.deltaPaused = delta
  
  globalTour.TIMEPASSEDBY += delta
  globalTour.TIMELEFT = globalTour.TRAVELTIME - globalTour.TIMEPASSEDBY
};

// Resume function
window.resumeTweens = function () {
  if (!window._tweenPaused) return;
  const resumeTime = performance.now()
  const delta = resumeTime - window._pauseTime;
  window.TWEEN.getAll().forEach(t => {
    // Shift each tween's start time forward by the paused duration
    if (t._startTime) t._startTime += delta;
  });
  window._tweenPaused = false;
  
  globalTour.deltaResumed = delta
  //globalTour.deltaResumed.push(delta)
  //globalTour.startTime = resumeTime
};

$('#dropdownmenu-tour').mouseover(ev => {
  ev.preventDefault()
  $('#dropdownmenu-tour .dropdown-content').css('display', '')
})
$('#dropdownmenu-tour .dropdown-content span').mousedown(ev => {
  ev.preventDefault()
  tours = tourDict[ev.target.id]
  playPauseIconMousedown(true)
  $('#dropdownmenu-tour .dropdown-content').css('display', 'none')
})

globeDiv.addEventListener('mousedown', function(ev) {
  if (playTour && ev.button == 0) {
    ev.preventDefault()
    playPauseIconMousedown(false)
    $('#dropdownmenu-tour .dropdown-content').css('display', '')
  }
})

globeDiv.addEventListener('touchstart', function () {
  if (playTour) {
//    ev.preventDefault()
    playPauseIconMousedown(false)
    $('#dropdownmenu-tour .dropdown-content').css('display', '')
  }
}, { passive: true });


//globeDiv.addEventListener('pointerdown', ev => {
//});
//globeDiv.addEventListener('pointerup', ev => {
//});
//globeDiv.addEventListener('pointermove', ev => {
//});

let lastPointerType = null;
canvas = globe.renderer().domElement
//canvas.addEventListener('click', (event) => {});
//canvas.addEventListener('mousemove', (event) => {});
canvas.addEventListener('pointerdown', ev => {
  lastPointerType = ev.pointerType; // "mouse", "touch", or "pen"
}, { passive: true });
canvas.addEventListener('pointerup', ev => {
  lastPointerType = null
});
canvas.addEventListener('pointermove', ev => {
  lastPointerType = null
});

let longTapTimer;
let startX;
let startY;

globeDiv.addEventListener('pointerdown', ev => {
  if (ev.pointerType !== 'touch' || !ev.isPrimary) return;

  startX = ev.clientX;
  startY = ev.clientY;

  longTapTimer = setTimeout(() => {
    handleLongTap(ev);
  }, 600);
});

globeDiv.addEventListener('pointermove', ev => {
  if (
    Math.abs(ev.clientX - startX) > 10 ||
    Math.abs(ev.clientY - startY) > 10
  ) {
    clearTimeout(longTapTimer);
  }
});

['pointerup', 'pointercancel'].forEach(type => {
  globeDiv.addEventListener(type, () => {
    clearTimeout(longTapTimer);
  });
});

function handleLongTap(ev) {
  if (!playTour) {
    clearSelection()
    hideTooltip()
    clearTour()
  }
}

/////////////
// WELCOME //
/////////////

var longWelcomeTimeout1, longWelcomeTimeout2

document.getElementById('play-pause-icon').addEventListener('mousedown', function(ev) {
  ev.preventDefault()
  if (!globeInMotion2()) {
    commonWelcomeActions()
    if (PLAYWELCOME) {
      hiWelcome()
    }
    else {
      byeWelcome(true)
    }
  }
})

let timerId = null;
function startTimer(duration=58000) {
  cancelAnimationFrame(timerId);

  const circle = document.querySelector('#timer-svg .fg');
  const r = circle.r.baseVal.value;
  const c = 2 * Math.PI * r;

  circle.style.strokeDasharray = `${c} ${c}`;
  circle.style.strokeDashoffset = c;

  const start = performance.now();

  function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    circle.style.strokeDashoffset = c * (1 - p);
    if (p < 1) {
      timerId = requestAnimationFrame(tick);
    }
  }

  timerId = requestAnimationFrame(tick);
}

function commonWelcomeActions() {
  PLAYWELCOME = !PLAYWELCOME
  ALLOWINTERACTION = !PLAYWELCOME
}

function fakeClickStart() {
  $('#fake-cursor').removeClass('visible')
  $('#left-click').addClass('visible')
}

function fakeClickEnd() {
  $('#fake-cursor').addClass('visible')
  $('#left-click').removeClass('visible')
}

function hiWelcome() {
  $('#interface').addClass('welcome')
  $('#menu-icon').addClass('welcome')
  $('#reset-icon').addClass('welcome')
  $('#side-panel').addClass('welcome')
  $('.band').addClass('welcome')
  $('#play-pause-icon').addClass('welcome')
  $('#play-pause-container').addClass('welcome')
  $('#globe-container').addClass('welcome')
  $('#globeViz').addClass('welcome')
  $('#timer-svg').addClass('circular-progress-safari')
  if ($('#timer-svg').hasClass('circular-progress-safari')) {
    startTimer(58000)
  }

  $('.leftable').removeClass('left')
  $('#side-panel').removeClass('visible')
  $('#fake-cursor').addClass('visible')
  WELCOME_AUDIO.currentTime = WELCOME_AUDIO_START
  WELCOME_AUDIO.play()
  
  clearTour()
  hideTooltip()
  closeSearch2()
  clearSelection()
  resetGlobe(initLoc, 1000, 'transition-translate-1')
  // clearHighlights()
  // hideCustomTooltip()
  // unhighlightFromSVG()
  // hidePieceInformation()
  
  setTimeout(() => { rotateGlobe1() }, 2000) // 0
  
}

function rotateGlobe1() {
  if (PLAYWELCOME) {
    tp = 50, left = 75
    $('#fake-cursor').animate({top: `${tp}%`, left: `${left}%`}, 4000) // WELCOMEINTERVALTIME
    
    setTimeout(() => {
      if (PLAYWELCOME) {
        //$('#left-click').addClass('visible')
        fakeClickStart()
        $('#left-click').css({top: `${tp - 1}%`, left: `${left + 1}%`})
        tp = 50, left = 25
        $('#left-click').animate({top: `${tp - 1}%`, left: `${left + 1}%`}, 4000) // 8000
        $('#fake-cursor').animate({top: `${tp}%`, left: `${left}%`}, 4000) // 8000
        const loc = {lng: initLoc.lng + 179.9}
        globe.pointOfView(loc, 4000 * 0.95, null, 'linear') // 8000
        
        longWelcomeTimeout1 = setTimeout(() => {
          if (PLAYWELCOME) {
            //$('#left-click').removeClass('visible')
            fakeClickEnd()
            rotateGlobe2()
          }
        }, 4000) // 8000
      }
    }, 4000) // WELCOMEINTERVALTIME
  }
}

function rotateGlobe2() {
  // rotTime introduced on Apr 28, 2026
  const rotTime = 1500
  if (PLAYWELCOME) {
    tp = 15, left = 50
    $('#fake-cursor').animate({top: `${tp}%`, left: `${left}%`}, rotTime)
    
    setTimeout(() => {
      if (PLAYWELCOME) {
        //$('#left-click').addClass('visible')
        fakeClickStart()
        $('#left-click').css({top: `${tp - 1}%`, left: `${left + 1}%`})
        tp = 50, left = 50
        $('#left-click').animate({top: `${tp - 1}%`, left: `${left + 1}%`}, rotTime)
        $('#fake-cursor').animate({top: `${tp}%`, left: `${left}%`}, rotTime)
        const loc = {lat: initLoc.lat + 70}
        globe.pointOfView(loc, rotTime * 0.95, null, 'linear')
        
        longWelcomeTimeout2 = setTimeout(() => {
          if (PLAYWELCOME) {
            //$('#left-click').removeClass('visible')
            fakeClickEnd()
            rotateGlobe3()
          }
        }, rotTime)
      }
    }, rotTime)
  }
}

function rotateGlobe3() {
  if (PLAYWELCOME) {
    tp = 70, left = 70
    $('#fake-cursor').animate({top: `${tp}%`, left: `${left}%`}, 1000) // WELCOMEINTERVALTIME
    
    setTimeout(() => {
      if (PLAYWELCOME) {
        //$('#left-click').addClass('visible')
        fakeClickStart()
        $('#left-click').css({top: `${tp - 1}%`, left: `${left + 1}%`})
        tp = 70, left = 30
        $('#left-click').animate({top: `${tp - 1}%`, left: `${left + 1}%`}, 4000) // 8000
        $('#fake-cursor').animate({top: `${tp}%`, left: `${left}%`}, 4000) // 8000
        const loc = {lng: initLoc.lng + 359.9}
        globe.pointOfView(loc, 4000 * 0.95, null, 'linear') // 8000
        
        longWelcomeTimeout1 = setTimeout(() => {
          if (PLAYWELCOME) {
            //$('#left-click').removeClass('visible')
            fakeClickEnd()
            rotateGlobe4()
          }
        }, 4000) // 8000
      }
    }, 1000) // WELCOMEINTERVALTIME
  }
}

function rotateGlobe4() {
  // rotTime introduced on Apr 28, 2026
  const rotTime = 1500
  if (PLAYWELCOME) {
    tp = 60, left = 50
    $('#fake-cursor').animate({top: `${tp}%`, left: `${left}%`}, rotTime)
    
    setTimeout(() => {
      if (PLAYWELCOME) {
        //$('#left-click').addClass('visible')
        fakeClickStart()
        $('#left-click').css({top: `${tp - 1}%`, left: `${left + 1}%`})
        tp = 25, left = 50
        $('#left-click').animate({top: `${tp - 1}%`, left: `${left + 1}%`}, rotTime)
        $('#fake-cursor').animate({top: `${tp}%`, left: `${left}%`}, rotTime)
        const loc = {lat: initLoc.lat}
        globe.pointOfView(loc, rotTime * 0.95, null, 'linear')
        
        longWelcomeTimeout2 = setTimeout(() => {
          if (PLAYWELCOME) {
            //$('#left-click').removeClass('visible')
            fakeClickEnd()
            gotoUS()
          }
        }, 2000) // not rotTime here
      }
    }, rotTime)
  }
}

function gotoUS() {
  if (PLAYWELCOME) {
    tp = 35, left = 50
    $('#fake-cursor').animate({top: `${tp}%`, left: `${left}%`}, 1000)
    
    setTimeout(() => {
      if (PLAYWELCOME) {
        //$('#mouse-wheel-2').addClass('visible')
        //$('#mouse-wheel-2').css({top: `${tp - 1}%`, left: `${left + 1}%`})
        const loc = {altitude: 3}
        globe.pointOfView(loc, 1000, null, 'linear')
        
        setTimeout(() => {
          if (PLAYWELCOME) {
            //$('#mouse-wheel-2').removeClass('visible')
            
            tp = 20, left = 50
            $('#fake-cursor').animate({top: `${tp}%`, left: `${left}%`}, 500)
            
            setTimeout(() => {
              if (PLAYWELCOME) {
                //$('#left-click').addClass('visible')
                fakeClickStart()
                $('#left-click').css({top: `${tp - 1}%`, left: `${left + 1}%`})
                tp = 50, left = 50
                $('#left-click').animate({top: `${tp - 1}%`, left: `${left + 1}%`}, 500)
                $('#fake-cursor').animate({top: `${tp}%`, left: `${left}%`}, 500)
                const loc = {lat: 30}
                globe.pointOfView(loc, 500, null, 'linear')
                
                setTimeout(() => {
                  if (PLAYWELCOME) {
                    //$('#left-click').removeClass('visible')
                    fakeClickEnd()
                    highlightPoles()
                  }
                }, 500)
              }
            }, 500)
          }
        }, 1000)
      }
    }, 1000)
  }
}

function highlightPoles() {
  const t1 = 500
  const t2 = 100
  var p
  
  // Go to Atlanta, GA, USA
  setTimeout(() => {
    if (PLAYWELCOME) {
      // setTimeout(() => { unhighlightPoleAndSpheres(p) }, t2)
      tp = 42.2, left = 53.5
      $('#fake-cursor').animate({top: `${tp}%`, left: `${left}%`}, t1)
      setTimeout(() => {
        p = cityPole['Atlanta, GA, USA']
        highlightPoleAndSpheres(p)
        showTooltip(p)
        
        // Go to Nashville, TN, USA
        setTimeout(() => {
          if (PLAYWELCOME) {
            setTimeout(() => { unhighlightPoleAndSpheres(p) }, t2)
            tp = 40, left = 51
            $('#fake-cursor').animate({top: `${tp}%`, left: `${left}%`}, t1)
            setTimeout(() => {
              p = cityPole['Nashville, TN, USA']
              highlightPoleAndSpheres(p)
              showTooltip(p)
              
              // Go to Evansville, IN, USA
              setTimeout(() => {
                if (PLAYWELCOME) {
                  setTimeout(() => { unhighlightPoleAndSpheres(p) }, t2)
                  tp = 37, left = 50.4
                  $('#fake-cursor').animate({top: `${tp}%`, left: `${left}%`}, t1)
                  setTimeout(() => {
                    p = cityPole['Evansville, IN, USA']
                    highlightPoleAndSpheres(p)
                    showTooltip(p)
                    
                    // Go to Terre Haute, IN, USA
                    setTimeout(() => {
                      if (PLAYWELCOME) {
                        setTimeout(() => { unhighlightPoleAndSpheres(p) }, t2)
                        tp = 34.5, left = 50.6
                        $('#fake-cursor').animate({top: `${tp}%`, left: `${left}%`}, t1)
                        setTimeout(() => {
                          p = cityPole['Terre Haute, IN, USA']
                          highlightPoleAndSpheres(p)
                          showTooltip(p)
                          
                          // Go to Chicago, IL, USA (I)
                          setTimeout(() => {
                            if (PLAYWELCOME) {
                              setTimeout(() => { unhighlightPoleAndSpheres(p) }, t2)
                              tp = 30, left = 50.4
                              $('#fake-cursor').animate({top: `${tp}%`, left: `${left}%`}, t1)
                              setTimeout(() => {
                                p = cityPole['Chicago, IL, USA']
                                highlightPoleAndSpheres(p)
                                showTooltip(p)
                                
                                // Go to Chicago, IL, USA (II)
                                setTimeout(() => {
                                  if (PLAYWELCOME) {
                                    // setTimeout(() => { unhighlightPoleAndSpheres(p) }, t2)
                                    tp = 25, left = 50.4
                                    $('#fake-cursor').animate({top: `${tp}%`, left: `${left}%`}, t1)
                                    setTimeout(() => {
                                      // p = cityPole['Chicago, IL, USA']
                                      // highlightPoleAndSpheres(p)
                                      // showTooltip(p)
                                      
                                      // Go to East Lansing, MI, USA
                                      setTimeout(() => {
                                        if (PLAYWELCOME) {
                                          setTimeout(() => { unhighlightPoleAndSpheres(p) }, t2)
                                          tp = 22, left = 53.3
                                          $('#fake-cursor').animate({top: `${tp}%`, left: `${left}%`}, t1)
                                          setTimeout(() => {
                                            p = cityPole['East Lansing, MI, USA']
                                            highlightPoleAndSpheres(p)
                                            showTooltip(p)
                                            
                                            // Go to Ann Arbor, MI, USA
                                            setTimeout(() => {
                                              if (PLAYWELCOME) {
                                                setTimeout(() => { unhighlightPoleAndSpheres(p) }, t2)
                                                tp = 24, left = 54
                                                $('#fake-cursor').animate({top: `${tp}%`, left: `${left}%`}, t1)
                                                setTimeout(() => {
                                                  p = cityPole['Ann Arbor, MI, USA']
                                                  highlightPoleAndSpheres(p)
                                                  showTooltip(p)
                                                  
                                                  // Go to Detroit, MI, USA
                                                  setTimeout(() => {
                                                    if (PLAYWELCOME) {
                                                      setTimeout(() => { unhighlightPoleAndSpheres(p) }, t2)
                                                      tp = 24, left = 54.5
                                                      $('#fake-cursor').animate({top: `${tp}%`, left: `${left}%`}, t1)
                                                      setTimeout(() => {
                                                        p = cityPole['Detroit, MI, USA']
                                                        highlightPoleAndSpheres(p)
                                                        showTooltip(p)
                                                        setTimeout(() => {
                                                          //$('#left-click').addClass('visible')
                                                          fakeClickStart()
                                                          $('#left-click').css({top: `${tp - 1}%`, left: `${left + 1}%`})
                                                          setTimeout(() => { $('#left-click').removeClass('visible') }, 2000)
                                                        }, 1000)
                                                        
                                                        setTimeout(() => {
                                                          if (PLAYWELCOME) {
                                                            //$('#left-click').removeClass('visible')
                                                            fakeClickEnd()
                                                            gotoTooltip()
                                                          }
                                                        }, WELCOMEINTERVALTIME)
                                                      }, t1)
                                                    }
                                                  }, t2)
                                                }, t1)
                                              }
                                            }, t2)
                                          }, t1)
                                        }
                                      }, t2)
                                    }, t1)
                                  }
                                }, 0)
                              }, t1)
                            }
                          }, t2)
                        }, t1)
                      }
                    }, t2)
                  }, t1)
                }
              }, t2)
            }, t1)
          }
        }, t2)
      }, t1)
    }
  }, 0)
}

function gotoTooltip() {
  // Go to Venues
  if (PLAYWELCOME) {
    tp = 21, left = 15
    $('#fake-cursor').animate({top: `${tp}%`, left: `${left}%`}, WELCOMEINTERVALTIME)
    
    setTimeout(() => {
      if (PLAYWELCOME) {
        $('.tooltip-opt[data-name="tooltip-venues"]').addClass('fake-hover')
        setTimeout(() => {
          $('.tooltip-opt[data-name="tooltip-venues"]').trigger('mousedown')
          //$('#left-click').addClass('visible')
          $('#left-click').css({top: `${tp - 1}%`, left: `${left + 1}%`})
        }, 500)
        setTimeout(() => { $('#left-click').removeClass('visible') }, 2000)
        
        setTimeout(() => {
          // Line below added on Apr 28, 2026
          const gotoPerfTime = 700
          // Go to Performances
          setTimeout(() => {
            $('.tooltip-opt[data-name="tooltip-venues"]').removeClass('fake-hover')
          }, gotoPerfTime)
          
          if (PLAYWELCOME) {
            tp = 21, left = 18
            $('#fake-cursor').animate({top: `${tp}%`, left: `${left}%`}, gotoPerfTime)
            
            setTimeout(() => {
              $('.tooltip-opt[data-name="tooltip-beta"]').addClass('fake-hover')
            }, gotoPerfTime)
            
            setTimeout(() => {
              if (PLAYWELCOME) {
                setTimeout(() => {
                  //$('.tooltip-opt[data-name="tooltip-beta"]').addClass('fake-hover')
                  $('.tooltip-opt[data-name="tooltip-beta"]').trigger('mousedown')
                  //$('#left-click').addClass('visible')
                  $('#left-click').css({top: `${tp - 1}%`, left: `${left + 1}%`})
                }, 200)
                setTimeout(() => { $('#left-click').removeClass('visible') }, gotoPerfTime)
                
                setTimeout(() => {
                  // Scroll down
                  setTimeout(() => {
                    $('.tooltip-opt[data-name="tooltip-beta"]').removeClass('fake-hover')
                  }, 200)
                  
//                  Commented on Apr 28, 2026
//                  if (PLAYWELCOME) {
//                    tp = 60, left = 18
//                    $('#fake-cursor').animate({top: `${tp}%`, left: `${left}%`}, 1000)
//                    
//                    setTimeout(() => {
//                      if (PLAYWELCOME) {
//                        //$('#mouse-wheel-1').addClass('visible')
//                        //$('#mouse-wheel-1').css({top: `${tp - 1}%`, left: `${left + 1}%`})
//                        $('#my-tooltip').animate({scrollTop: 5000}, 1500)
//                        setTimeout(() => {
//                          if (PLAYWELCOME) {
//                            //$('#mouse-wheel-1').removeClass('visible')
//                            gotoReset()
//                          }
//                        }, 1500)
//                      }
//                    }, 1000)
//                  }
//                  Line below added on Apr 28, 2026
                  gotoReset()
                }, gotoPerfTime)
              }
            }, gotoPerfTime)
          }
//        Apr 28, 2026
//        }, WELCOMEINTERVALTIME)
        }, WELCOMEINTERVALTIME / 2)
      }
    }, WELCOMEINTERVALTIME)
  }
}

function gotoReset() {
  if (PLAYWELCOME) {
    tp = 12.5, left = 14.2
//    Apr 28, 2026
//    $('#fake-cursor').animate({top: `${tp}%`, left: `${left}%`}, WELCOMEINTERVALTIME)
    $('#fake-cursor').animate({top: `${tp}%`, left: `${left}%`}, WELCOMEINTERVALTIME / 2)
    
    setTimeout(() => {
      if (PLAYWELCOME) {
        $('#reset-icon').addClass('fake-hover')
        //$('#left-click').addClass('visible')
        $('#left-click').css({top: `${tp - 1}%`, left: `${left + 1}%`})
        resetGlobe(initLoc, 1000, 'transition-translate-1')
        
        setTimeout(() => {
          $('#left-click').removeClass('visible')
          $('#reset-icon').removeClass('fake-hover')
          gotoSidePanel()
//        Apr 28, 2026
//        }, 1000)
        }, 1500)
      }
//    Apr 28, 2026
//    }, WELCOMEINTERVALTIME)
    }, WELCOMEINTERVALTIME / 2)
  }
}

function gotoSidePanel() {
//  Apr 28, 2026
  const sidepanelTime = 1000
  if (PLAYWELCOME) {
    tp = 12.5, left = 11.3
    $('#fake-cursor').animate({top: `${tp}%`, left: `${left}%`}, sidepanelTime)
    
    setTimeout(() => {
      if (PLAYWELCOME) {
        $('#menu-icon').addClass('fake-hover')
        //$('#left-click').addClass('visible')
        $('#left-click').css({top: `${tp - 1}%`, left: `${left + 1}%`})
        $('.leftable').addClass('left')
        $('#side-panel').addClass('visible')
        
        setTimeout(() => {
          $('#left-click').removeClass('visible')
          $('#menu-icon').removeClass('fake-hover')
          gotoSearch()
        }, 1000)
      }
    }, sidepanelTime)
  }
}

function gotoSearch() {
  // Added on Apr 28, 2026
  const typeTime = 1000
  const typeOffset = 400
  if (PLAYWELCOME) {
    tp = 31, left = 15
    $('#fake-cursor').animate({top: `${tp}%`, left: `${left}%`}, typeTime)
    
    setTimeout(() => {
      if (PLAYWELCOME) {
        //$('#left-click').addClass('visible')
        $('#left-click').css({top: `${tp - 1}%`, left: `${left + 1}%`})
        setTimeout(() => { $('#left-click').removeClass('visible') }, typeOffset)
        
        $('div.searchResults').show()
        setTimeout(() => {
          $('#searchInput').val('S'); $('li.liPerformer').hide(); $('li.liPerformer:contains(S)').show() }, typeOffset)
        setTimeout(() => {
          $('#searchInput').val('St'); $('li.liPerformer').hide(); $('li.liPerformer:contains(St)').show() }, typeOffset + 400)
        setTimeout(() => {
          $('#searchInput').val('Sto'); $('li.liPerformer').hide(); $('li.liPerformer:contains(Sto)').show() }, typeOffset + 800)
        setTimeout(() => {
          $('#searchInput').val('Stoc'); $('li.liPerformer').hide(); $('li.liPerformer:contains(Stoc)').show() }, typeOffset + 1200)
        setTimeout(() => {
          $('#searchInput').val('Stock'); $('li.liPerformer').hide(); $('li.liPerformer:contains(Stock)').show() }, typeOffset + 1600)
        
        setTimeout(() => {
          if (PLAYWELCOME) {
            gotoResults()
          }
        }, typeOffset + 1600)
      }
    }, typeTime)
  }
}

function gotoResults() {
  if (PLAYWELCOME) {
    tp = 33.5, left = 16
    $('#fake-cursor').animate({top: `${tp}%`, left: `${left}%`}, 1000)
    
    setTimeout(() => {
      if (PLAYWELCOME) {
        $('li[id="Stockholm, Sweden"]').addClass('selected')
        //$('#left-click').addClass('visible')
        $('#left-click').css({top: `${tp - 1}%`, left: `${left + 1}%`})
        setTimeout(() => { $('#left-click').removeClass('visible') }, 1000)
        
        const city = 'Stockholm, Sweden'
        const pole = cityPole[city]
        const lat = pole.lat
        const lng = pole.lng
        const loc = {lat: lat - 20, lng: lng, altitude: 3}
        goTo(loc, 50, searchTravelTime, 'search')
        setTimeout(() => {
          clickOnPole(pole, true)
        }, 1000)
        
        setTimeout(() => {
          gotoTours()
//        Apr 28, 2026
//        }, WELCOMEINTERVALTIME * 2)
        }, WELCOMEINTERVALTIME * 1.5)
      }
    }, 1000)
  }
}

function gotoTours() {
//  Apr 28, 2026
  const gotoToursTime = 800
  if (PLAYWELCOME) {
    tp = 28.5, left = 15
    $('#fake-cursor').animate({top: `${tp}%`, left: `${left}%`}, gotoToursTime)
    
    setTimeout(() => {
      if (PLAYWELCOME) {
        $('#dropdownmenu-tour .dropdown-content').css('display', 'block')
        tp = 30.5, left = 15
        $('#fake-cursor').animate({top: `${tp}%`, left: `${left}%`}, gotoToursTime)
        
        setTimeout(() => {
          if (PLAYWELCOME) {
            $('#dropdownmenu-tour .dropdown-content span:nth-child(1)').addClass('fake-hover')
            tp = 32.5, left = 15.5
            $('#fake-cursor').animate({top: `${tp}%`, left: `${left}%`}, gotoToursTime)
            
            setTimeout(() => {
              if (PLAYWELCOME) {
                $('#dropdownmenu-tour .dropdown-content span:nth-child(1)').removeClass('fake-hover')
                $('#dropdownmenu-tour .dropdown-content span:nth-child(2)').addClass('fake-hover')
                tp = 34.5, left = 15.5
                $('#fake-cursor').animate({top: `${tp}%`, left: `${left}%`}, gotoToursTime)
                
                setTimeout(() => {
                  if (PLAYWELCOME) {
                    $('#dropdownmenu-tour .dropdown-content span:nth-child(2)').removeClass('fake-hover')
                    $('#dropdownmenu-tour .dropdown-content span:nth-child(3)').addClass('fake-hover')
                    
                    setTimeout(() => {
                      if (PLAYWELCOME) {
                        $('#dropdownmenu-tour .dropdown-content span:nth-child(3)').removeClass('fake-hover')
                        setTimeout(() => {
                          $('#dropdownmenu-tour .dropdown-content').css('display', 'none')
                          $('#dropdownmenu-tour .dropdown-content').css('display', '')
                        }, 500)
                        gotoVideo()
                      }
//                    Apr 28, 2026
//                    }, WELCOMEINTERVALTIME)
                    }, WELCOMEINTERVALTIME / 2)
                  }
                }, gotoToursTime)
              }
            }, gotoToursTime)
          }
        }, gotoToursTime)
      }
    }, gotoToursTime)
  }
}

function gotoVideo() {
  var top, left
  top = 25, left = 13
  $('#fake-cursor').animate({top: `${top}%`, left: `${left}%`}, WELCOMEINTERVALTIME * 0.5)
  setTimeout(() => {
    if (PLAYWELCOME) {
      const tooltip = document.getElementById('custom-tooltip')
      const link = document.getElementById('video-link');
      tooltip.textContent = link.getAttribute('title'); // Use the title text
      tooltip.style.left = (left - 6) + '%'
      tooltip.style.top =  (top - 4) + '%'
      tooltip.style.visibility = 'visible'
      setTimeout(() => {
        if (PLAYWELCOME) {
          tooltip.style.visibility = 'hidden'
          byeWelcome(false)
        }
      }, WELCOMEINTERVALTIME * 2)
    }
  }, WELCOMEINTERVALTIME * 0.5)
}

function beep() {
    var snd = new Audio("data:audio/wav;base64,//uQRAAAAWMSLwUIYAAsYkXgoQwAEaYLWfkWgAI0wWs/ItAAAGDgYtAgAyN+QWaAAihwMWm4G8QQRDiMcCBcH3Cc+CDv/7xA4Tvh9Rz/y8QADBwMWgQAZG/ILNAARQ4GLTcDeIIIhxGOBAuD7hOfBB3/94gcJ3w+o5/5eIAIAAAVwWgQAVQ2ORaIQwEMAJiDg95G4nQL7mQVWI6GwRcfsZAcsKkJvxgxEjzFUgfHoSQ9Qq7KNwqHwuB13MA4a1q/DmBrHgPcmjiGoh//EwC5nGPEmS4RcfkVKOhJf+WOgoxJclFz3kgn//dBA+ya1GhurNn8zb//9NNutNuhz31f////9vt///z+IdAEAAAK4LQIAKobHItEIYCGAExBwe8jcToF9zIKrEdDYIuP2MgOWFSE34wYiR5iqQPj0JIeoVdlG4VD4XA67mAcNa1fhzA1jwHuTRxDUQ//iYBczjHiTJcIuPyKlHQkv/LHQUYkuSi57yQT//uggfZNajQ3Vmz+Zt//+mm3Wm3Q576v////+32///5/EOgAAADVghQAAAAA//uQZAUAB1WI0PZugAAAAAoQwAAAEk3nRd2qAAAAACiDgAAAAAAABCqEEQRLCgwpBGMlJkIz8jKhGvj4k6jzRnqasNKIeoh5gI7BJaC1A1AoNBjJgbyApVS4IDlZgDU5WUAxEKDNmmALHzZp0Fkz1FMTmGFl1FMEyodIavcCAUHDWrKAIA4aa2oCgILEBupZgHvAhEBcZ6joQBxS76AgccrFlczBvKLC0QI2cBoCFvfTDAo7eoOQInqDPBtvrDEZBNYN5xwNwxQRfw8ZQ5wQVLvO8OYU+mHvFLlDh05Mdg7BT6YrRPpCBznMB2r//xKJjyyOh+cImr2/4doscwD6neZjuZR4AgAABYAAAABy1xcdQtxYBYYZdifkUDgzzXaXn98Z0oi9ILU5mBjFANmRwlVJ3/6jYDAmxaiDG3/6xjQQCCKkRb/6kg/wW+kSJ5//rLobkLSiKmqP/0ikJuDaSaSf/6JiLYLEYnW/+kXg1WRVJL/9EmQ1YZIsv/6Qzwy5qk7/+tEU0nkls3/zIUMPKNX/6yZLf+kFgAfgGyLFAUwY//uQZAUABcd5UiNPVXAAAApAAAAAE0VZQKw9ISAAACgAAAAAVQIygIElVrFkBS+Jhi+EAuu+lKAkYUEIsmEAEoMeDmCETMvfSHTGkF5RWH7kz/ESHWPAq/kcCRhqBtMdokPdM7vil7RG98A2sc7zO6ZvTdM7pmOUAZTnJW+NXxqmd41dqJ6mLTXxrPpnV8avaIf5SvL7pndPvPpndJR9Kuu8fePvuiuhorgWjp7Mf/PRjxcFCPDkW31srioCExivv9lcwKEaHsf/7ow2Fl1T/9RkXgEhYElAoCLFtMArxwivDJJ+bR1HTKJdlEoTELCIqgEwVGSQ+hIm0NbK8WXcTEI0UPoa2NbG4y2K00JEWbZavJXkYaqo9CRHS55FcZTjKEk3NKoCYUnSQ0rWxrZbFKbKIhOKPZe1cJKzZSaQrIyULHDZmV5K4xySsDRKWOruanGtjLJXFEmwaIbDLX0hIPBUQPVFVkQkDoUNfSoDgQGKPekoxeGzA4DUvnn4bxzcZrtJyipKfPNy5w+9lnXwgqsiyHNeSVpemw4bWb9psYeq//uQZBoABQt4yMVxYAIAAAkQoAAAHvYpL5m6AAgAACXDAAAAD59jblTirQe9upFsmZbpMudy7Lz1X1DYsxOOSWpfPqNX2WqktK0DMvuGwlbNj44TleLPQ+Gsfb+GOWOKJoIrWb3cIMeeON6lz2umTqMXV8Mj30yWPpjoSa9ujK8SyeJP5y5mOW1D6hvLepeveEAEDo0mgCRClOEgANv3B9a6fikgUSu/DmAMATrGx7nng5p5iimPNZsfQLYB2sDLIkzRKZOHGAaUyDcpFBSLG9MCQALgAIgQs2YunOszLSAyQYPVC2YdGGeHD2dTdJk1pAHGAWDjnkcLKFymS3RQZTInzySoBwMG0QueC3gMsCEYxUqlrcxK6k1LQQcsmyYeQPdC2YfuGPASCBkcVMQQqpVJshui1tkXQJQV0OXGAZMXSOEEBRirXbVRQW7ugq7IM7rPWSZyDlM3IuNEkxzCOJ0ny2ThNkyRai1b6ev//3dzNGzNb//4uAvHT5sURcZCFcuKLhOFs8mLAAEAt4UWAAIABAAAAAB4qbHo0tIjVkUU//uQZAwABfSFz3ZqQAAAAAngwAAAE1HjMp2qAAAAACZDgAAAD5UkTE1UgZEUExqYynN1qZvqIOREEFmBcJQkwdxiFtw0qEOkGYfRDifBui9MQg4QAHAqWtAWHoCxu1Yf4VfWLPIM2mHDFsbQEVGwyqQoQcwnfHeIkNt9YnkiaS1oizycqJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");  
    snd.play();
}

function byeWelcome(stoppedByUser) {
  if (stoppedByUser) {
    WELCOME_AUDIO.pause()
    WELCOME_AUDIO.currentTime = WELCOME_AUDIO_START
  }
  else {
    const timeLeft = 58 - WELCOME_AUDIO_START - WELCOME_AUDIO.currentTime
    if (timeLeft > 0) {
      setTimeout(() => {
      }, timeLeft * 1000)
    }
  }
  
  clearTour()
  hideTooltip()
  closeSearch2()
  clearSelection()
  resetGlobe(initLoc, tourTravelTime/2, 'transition-translate-2') // /2 -> Attempt to prevent flickering
  setTimeout(() => { window.TWEEN.getAll().forEach(t => { t.stop(); t.end() }) }, tourTravelTime/2 + 500) // /2 -> Attempt to prevent flickering
  
  clearTimeout(longWelcomeTimeout1)
  clearTimeout(longWelcomeTimeout2)
  $('#fake-cursor').stop()
  $('#left-click').stop()
  
  $('#interface').removeClass('welcome')
  $('#menu-icon').removeClass('welcome')
  $('#reset-icon').removeClass('welcome')
  $('#side-panel').removeClass('welcome')
  $('.band').removeClass('welcome')
  $('#play-pause-icon').removeClass('welcome')
  $('#play-pause-container').removeClass('welcome')
  $('#globe-container').removeClass('welcome')
  $('#globeViz').removeClass('welcome')
  $('#timer-svg').removeClass('circular-progress-safari')
  cancelAnimationFrame(timerId)
  
  $('.leftable').removeClass('left'); // $('#interface-content').removeClass('left')
  $('#side-panel').removeClass('visible')
  $('#fake-cursor').removeClass('visible')
  $('#left-click').removeClass('visible')
  
//  setTimeout(() => {
    PLAYWELCOME = false
    ALLOWINTERACTION = true
    INTERACTION = true
//  }, WELCOMEINTERVALTIME)
  
  $('#dropdownmenu-tour .dropdown-content').css('display', 'none')
  $('#dropdownmenu-tour .dropdown-content').css('display', '')
  $('#dropdownmenu-tour .dropdown-content span').removeClass('fake-hover')
  $('#dropdownmenu-tour .dropdown-content span').removeClass('selected')
//  $('#dropdownmenu-tour .dropdown-content span:nth-child(1)').addClass('selected')
}

///////////
// TOURS //
///////////
function playPauseIconMousedown(play, run=true) {
  var activeTourTimer
  try {
    playTour = play
    if (run)
      runTours(tours) // fails when the globe is loading; on top of this, disable play button on globe load
    
    if (playTour) { // THE FOLLOWING NUMBERS 1-4 CORRESPOND TO MY NOTES P.116
      clearSelection()
      hideTooltip()
      //$('#menu-icon').addClass('inactive')
      $('#reset-icon').addClass('inactive')
      $('#play-pause-icon').addClass('inactive')
      $('body').addClass('active-tour')
      $('#side-container').addClass('active-tour')
      clearTimeout(activeTourTimer)
      if ($('#side-panel').hasClass('visible')) {
        $('#side-panel').removeClass('visible')
        if (isSideTour) { // 1
          setTimeout(() => {
            $('#side-panel-2').addClass('visible')
          }, 1000)
        }
        else { // 3
          $('.leftable').removeClass('left')
          //$('#side-panel').removeClass('visible')
          
          $('#my-tooltip-2').addClass('visible')
        }
      }
      else {
        if (isSideTour) { // 2
          $('.leftable').addClass('left')
          
          $('#side-panel-2').addClass('visible')
        }
        else { // 4
          $('#my-tooltip-2').addClass('visible')
        }
      }
    }
    else {
      $('.leftable').removeClass('left')
      $('#side-panel-2').removeClass('visible invisible')
      $('#my-tooltip-2').removeClass('visible invisible')
      setTimeout(() => {
        //$('#menu-icon').removeClass('inactive')
        $('#reset-icon').removeClass('inactive')
        $('#play-pause-icon').removeClass('inactive')
      }, tourTravelTime)
      $('body').removeClass('active-tour')
      activeTourTimer = setTimeout(() => { $('#side-container').removeClass('active-tour') }, 2000)
    }
  }
  catch(err) {
    playTour = false
  }
}
//})

const tourTravelTime = 6000
const nextStepDelay = 1000
const searchTravelTime = 2000

function goTo2(loc, translateY, travelTime, type) {
  const className = type == 'search' ? 'transition-translate-search' : type == 'tour' ? 'transition-translate-tour' : FAIL
  $(globeDiv).addClass(className)
  setTimeout(() => {
    $(globeDiv).removeClass(className)
  }, 100 + travelTime)
  $(globeDiv).css('translate', `${veryOriginalX}px ${veryOriginalY * translateY}px`)
//  $(globeDiv).css('translate', `${veryOriginalX}px ${veryOriginalY * 1}px`)
  globe.pointOfView(loc, travelTime, null, 'cubic')
  // if (globe.pointOfView().altitude < 9) TRUE
  $('#description').removeClass('visible')
  originalX = veryOriginalX, originalY = veryOriginalY * translateY
//  originalX = veryOriginalX, originalY = veryOriginalY * 1
}

var translateYAnimationFrameId = null
function translateY(y, duration) {
  if (controls.target.y != y) {
    const start = performance.now() + globalTour.deltaResumed//.reduce((a, b) => a + b, 0)
    const startY = controls.target.y

    function step(now) {
      const progress = Math.max(0, Math.min(1, (now - start) / duration))
      controls.target.y = startY + (y - startY) * progress
      controls.update()

      if (!window._tweenPaused) {
        if (progress < 1) {
          translateYAnimationFrameId = requestAnimationFrame(step)
        }
        else {
          controls.target.y = y
          translateYAnimationFrameId = null
        }
      }
    }
    
    if (translateYAnimationFrameId != null) {
      cancelAnimationFrame(translateYAnimationFrameId);
    }

    translateYAnimationFrameId = requestAnimationFrame(step)
    
    
  }
}
var translateXAnimationFrameId = null
function translateX(x, duration) {
  if (controls.target.x != x) {
    const start = performance.now() + globalTour.deltaResumed//.reduce((a, b) => a + b, 0)
    const startX = controls.target.x

    function step(now) {
      const progress = Math.max(0, Math.min(1, (now - start) / duration))
      controls.target.x = startX + (x - startX) * progress
      controls.update()

      if (!window._tweenPaused) {
        if (progress < 1) {
          translateXAnimationFrameId = requestAnimationFrame(step)
        }
        else {
          controls.target.x = x
          translateXAnimationFrameId = null
        }
      }
    }
    
    if (translateXAnimationFrameId != null) {
      cancelAnimationFrame(translateXAnimationFrameId);
    }

    translateXAnimationFrameId = requestAnimationFrame(step)
    
    
  }
}

var globalTour = {}
globalTour.translateY = 0
globalTour.translateX = 0
globalTour.i = 0
globalTour.j = 0
globalTour.progress = 0
globalTour.startTime = null
globalTour.deltaResumed = 0//[]
globalTour.deltaPaused = 0

globalTour.TRAVELTIME = tourTravelTime
globalTour.TIMEPASSEDBY = 0
globalTour.TIMELEFT = globalTour.TRAVELTIME - globalTour.TIMEPASSEDBY

function goTo(loc, transY, travelTime, type, transX=0) {
  //translateY(transY - loc.lat * 3 / 10, travelTime * 0.75)
  const transformedLat = -loc.lat
  const newY = type == 'tour' ? transY : (transformedLat < 20 ? transY : straightlineEquation(20, 50, 90, 130, transformedLat))
  // Anchorage 0-100, Accra 0-100, Melbourne 0-260
  const newX = transX
  
  globalTour.translateY = newY
  globalTour.translateX = newX
  
  translateY(newY, travelTime * 0.75)
  translateX(newX, travelTime * 0.75)
  globe.pointOfView(loc, travelTime, null, 'cubic')
  $('#description').removeClass('visible')
}

var timestart2
function foo2(timestamp) {
  if (!timestart2)
    timestart2 = timestamp
  const progress = (timestamp - timestart2) / 1000
  
  if (progress <= 1) {
    globe
    .customThreeObject(d => {
    })
    .customThreeObjectUpdate((obj, d) => {
      Object.assign(obj.position, globe.getCoords(d.lat, d.lng, d.alt * progress))
    })
    requestAnimationFrame(foo2)
  }
  else {
    globe
    .customThreeObject(d => {
    })
    .customThreeObjectUpdate((obj, d) => {
      Object.assign(obj.position, globe.getCoords(d.lat, d.lng, d.alt * 1))
    })
    timestart2 = null
  }
}

function hardResetGlobe(loc, rotationTime=1000, className='transition-translate-1') {
  globe.pointsTransitionDuration(0)
  
  const {lat, lng, altitude} = globe.pointOfView()
  globe
  .pointAltitude(0)
  .customThreeObject(d => {
  })
  .customThreeObjectUpdate((obj, d) => {
    Object.assign(obj.position, globe.getCoords(lat, lng, 0)) // d.lat, d.lng, d.alt -> lat, lng, 0
  })
  
  setTimeout(() => {
    resetGlobe(loc, rotationTime, className)
    setTimeout(() => {
      globe.pointsTransitionDuration(1000)
      globe.pointAltitude('altitude')
      requestAnimationFrame(foo2)
    }, rotationTime)
  }, 10)
}

function resetGlobe(loc, rotationTime, className, clearDelay) {
  window.TWEEN.removeAll()
  
  //clearSelection()
  setTimeout(() => { clearTour() }, clearDelay || 0)
  hideTooltip(true)
  $(globeDiv).addClass(className) // 'transition-translate-1' or '-2'
  setTimeout(() => {
    //$(globeDiv).css('translate', '')
    $(globeDiv).css('translate', `${veryOriginalX}px ${veryOriginalY}px`)
  }, 100)
  translateY(0, rotationTime * 0.75)
  translateX(0, rotationTime * 0.75)
  globe.pointOfView(loc, rotationTime)
  // if (globe.pointOfView().altitude < 9) FALSE
  $('#description').addClass('visible')
  setTimeout(() => {
    $(globeDiv).removeClass(className) // 'transition-translate-1' or '-2'
  }, rotationTime)
  originalX = veryOriginalX, originalY = veryOriginalY
}

var allSpheres
function runTours(tours, i=0, j=0, passedBy=0) { // globe7.js version
  // allSpheres = globe.customLayerData()
  // Calling globe.customLayerData() out of this function might return an empty 
  // result (because the data is not loaded yet).
  // Finally done in loadData()

  if (tours.id == 1 && i == 0 && j == 0 && passedBy == 0) {
    tours1Cities = []
    tours1.forEach(steps => { steps.forEach(step => {
      const dates = step.dates
      const spheres = allSpheres.filter(x =>
        (new Date(`${dates[0]}T00:00:00`)) <= (new Date(x.date)) &&
        (new Date(x.date)) <= (new Date(`${dates[1]}T00:00:00`))
      )
      const cities = spheres.map(x => x.city)
      tours1Cities = tours1Cities.concat(cities)
    })})
    tours1Countries = new Set(tours1Cities.map(x => x.includes(', ') ? x.split(', ')[1] : x))
    tours1.countries = tours1Countries
    tours1.initText = `Alvin Ailey American Dance Theater was contracted by the US Department of State for a number of international tours. By 1989, they had travelled to ${tours1Countries.size} countries as part of cultural diplomacy efforts.`
    
    $('#side-panel-2').html(tours.initText)
    $('#my-tooltip-2').html(tours.initText)
    $('#side-panel-2').removeClass('invisible')
    $('#my-tooltip-2').removeClass('invisible')
  }

  function runSteps(steps, i) {
    globalTour.i = i

    function nextStep(j) {
      globalTour.j = j
      globalTour.startTime = performance.now()
      
      if (j < steps.length && playTour && !window._tweenPaused) {
        const { goto, dates, altitude, translateY, alt, text, translateX } = steps[j]
        const { lat, lng } = goto ? cityPole[goto] : alt ? alt : globe.pointOfView()
        const latShift = goto ? 20 : 0
        const loc = {lat: lat - latShift, lng: lng, altitude: altitude}
        if (passedBy == 0)
          // only the first time for each step; after pausing, it will resume 
          // goTo without calling it again
          goTo(loc, translateY, tourTravelTime, 'tour', translateX)
        
        const spheres = allSpheres.filter(x =>
          (new Date(`${dates[0]}T00:00:00`)) <= (new Date(x.date)) &&
          (new Date(x.date)) <= (new Date(`${dates[1]}T00:00:00`))
        )
        const cities = spheres.map(x => x.city)
        const poles = cities.map(x => cityPole[x])
        const paths = myPathsData.filter(x =>
          cities.includes(x.src) &&
          cities.includes(x.dst) &&
          (new Date(`${dates[0]}T00:00:00`)) <= (new Date(x.date)) &&
          (new Date(x.date)) <= (new Date(`${dates[1]}T00:00:00`))
        )
        
//        if (globalTour.TIMEPASSEDBY == 0) {
//          globalTour.progress = 1
//        }
        justProgressTimer1 = setTimeout(() => {
          if (playTour && !window._tweenPaused && globalTour.TIMEPASSEDBY == 0) {
            globalTour.progress = 1
          }
        }, 0)
        
        unhighlightTimer = setTimeout(() => {
          if (playTour && !window._tweenPaused && globalTour.TIMEPASSEDBY < globalTour.TRAVELTIME / 4) {
              // && !(tours.id == 2 && i == 0 && j == 0 && passedBy == 0)) {
            globalTour.progress = 2
            disableAllPoleSpheresPaths()
          }
        }, globalTour.TRAVELTIME / 4 - globalTour.TIMEPASSEDBY)
        
        highlightTimer = setTimeout(() => {
          if (playTour && !window._tweenPaused && globalTour.TIMEPASSEDBY < globalTour.TRAVELTIME / 2) {
            globalTour.progress = 3
            poles.forEach(d => {
              highlightPoleAndSpheres(d, poles)
              // addToSelection(d) // HIDE TO PREVENT DISPLAYING TOOLTIP AFTER ENDING TOUR
            })
            paths.forEach(d => {
              showPath(d, 3 / altitude)
              addToPaths(d)
            })
            $('#side-panel-2').html(text)
            $('#my-tooltip-2').html(text)
            $('#side-panel-2').removeClass('invisible')
            $('#my-tooltip-2').removeClass('invisible')
          }
        }, globalTour.TRAVELTIME / 2 - globalTour.TIMEPASSEDBY)
        
        justProgressTimer2 = setTimeout(() => {
          if (playTour && !window._tweenPaused && globalTour.TIMEPASSEDBY < globalTour.TRAVELTIME * 3 / 4) {
            globalTour.progress = 4
          }
        }, globalTour.TRAVELTIME * 3 / 4 - globalTour.TIMEPASSEDBY)
        
        nextTimer = setTimeout(() => {
          if (playTour && !window._tweenPaused) {
            globalTour.progress = 0
            setTimeout(() => {
                $('#side-panel-2').addClass('invisible')
                $('#my-tooltip-2').addClass('invisible')
            }, nextStepDelay)
            globalTour.deltaPaused = 0
            passedBy = 0
            globalTour.TIMEPASSEDBY = 0
            globalTour.TIMELEFT = globalTour.TRAVELTIME - globalTour.TIMEPASSEDBY
            nextStep(j+1)
          }
//        }, tourTravelTime + nextStepDelay - passedBy)
//        }, globalTour.TIMELEFT)
        }, globalTour.TIMELEFT + nextStepDelay)
      }
      else {
        //setTimeout(() => { clearTour() }, tourTravelTime / 4 - passedBy)
        globalTour.progress = 0
        nextTour(i+1)
      }
    }

    nextStep(j)

  }

  function nextTour(i) {
    if (i < tours.length && playTour && !window._tweenPaused) {
      const steps = tours[i]
      runSteps(steps, i)
    }
    else {
      //endTour() // 1000 delay added if ended "naturally"
      setTimeout(() => { endTour() }, i == tours.length ? 1000 : 0)
      playTour = false
      window._tweenPaused = false
    }
  }

  nextTour(i)

}

var playTour = false
var nextTimer
var highlightTimer
var unhighlightTimer
var justProgressTimer1
var justProgressTimer2
var endingTour = false
var tourTimeout

const tours1 = [
//  [{
//    goto: 'Cotabato City, Philippines',
//    dates: ['1950-01-01', '1950-01-01'],
//    altitude: 7,
//    translateY: 10,
//    text: 'Alvin Ailey American Dance Theater was contracted by the US Department of State for a number of international tours. By 1989, they had travelled to [X] countries as part of cultural diplomacy efforts.',
//  }],
  [{
    goto: 'Cotabato City, Philippines',
    dates: ['1962-02-03', '1962-05-11'],
    altitude: 6,
    translateY: 20,
    text: 'The first tour of 26 cities in Oceania and South East Asia took place in 1962, beginning in Australia and ending in South Korea.',
  }],
  [{
    goto: 'Kinshasa, Democratic Republic of Congo',
    dates: ['1967-09-15', '1967-11-02'],
    altitude: 4,
    translateY: 40,
    text: 'AAADT’s 1967 tour to Africa took them to 9 different countries, where they “gave three to four concerts a week and also presented lecture-demonstrations at colleges and community centers.”',
  }],
  [{
    goto: 'Oran, Algeria',
    dates: ['1970-07-03', '1970-07-30'],
    altitude: 3,
    translateY: 50,
    text: 'AAADT returned to Africa in July 1970 for another sponsored tour, where they added an extra show in Tunisia due to high audience demand.',
  }],
  [{
    goto: 'Warsaw, Poland',
    dates: ['1970-09-24', '1970-12-05'],
    altitude: 3,
    translateY: 50,
    text: 'Two months later, they previewed all of the potential works in repertory for Soviet officials to approve prior to traveling to six cities in the USSR, followed by Paris and London. One planned work, Adagio for a Dead Soldier, was not approved by the State Department.',
  }],
  [{
    goto: 'Vienna, Austria',
    dates: ['1974-06-12', '1974-07-26'],
    altitude: 2,
    translateY: 60,
    text: 'Following an intensive visit to the Socialist Federal Republic of Yugoslavia in 1967, with activities ranging from performances inside a fortress to a “meeting of solidarity” in Skopje, AAADT was sponsored for another trip to Eastern and Western Europe in summer 1974.',
  }],
  [{
    dates: ['1977-06-14', '1977-08-06'],
    altitude: 6,
    translateY: -10,
    alt: {lat: 45, lng: 80},
    text: 'Their 1977 State Department tour took them to 13 cities on 3 continents in just over 6 weeks.',
  }],
  [{
    goto: 'Bogotá, Colombia',
    dates: ['1978-05-29', '1978-07-02'],
    altitude: 6,
    translateY: 15,
    text: 'The 1978 Latin American tour exemplifies AAADT’s community engagement, including holding open company classes for local dancers and open rehearsals.',
  }],
  [{
    dates: ['1985-10-31', '1985-11-10'],
    altitude: 2,
    translateY: 70,
    alt: {lat: 10, lng: 120},
    text: 'In 1985, AAADT was “the first modern dance company to go on a U.S. government-sponsored tour of the People’s Republic of China since the normalization of China-United States relations.”  – ailey.org/history',
  }],
]
tours1.id = 1

//const international_tours = [
const tours2 = [
  [{
    goto: 'Sydney, Australia', // Final notes!!
    dates: [],
//    altitude: defaultAlt - 1,
    altitude: paramAlt,
    translateY: 0,
    //alt: null, // Final notes!!
    text: 'Sponsored by the US Department of State, AAADT’s first international trip took place in 1962, before they had ever traveled beyond the northeastern United States.',
  }],
  [{
    goto: 'Sydney, Australia',
    dates: ['1962-02-03', '1962-02-09'],
    altitude: 2,
    translateY: 140,
    text: 'That tour started in Sydney, Australia, then traveled to 26 cities in East Asia.',
  }],
  [{
    goto: 'Paris, France',
    dates: ['1964-09-07', '1964-09-30'],
    altitude: 2,
    translateY: 70,
    text: 'AAADT first performed in Paris in 1964, which became their most visited city outside of New York through 1989.',
  }],
  [{
    goto: 'Algiers, Algeria',
    dates: ['1970-07-16', '1970-07-18'],
    altitude: 2,
    translateY: 50,
    text: 'AAADT carried 8,000 pounds of luggage on the 1970 Africa tour, including stage lights they installed in Algiers.',
  }],
  [{
    goto: 'Moscow, Russia, U.S.S.R.',
    dates: ['1970-10-22', '1970-10-26'],
    altitude: 2,
    translateY: 60,
    text: 'On the 1970 Russia tour, they taught class at the Bolshoi Ballet in Moscow.',
  }],
  [{
    goto: 'Rabat, Morocco',
    dates: ['1978-12-31', '1978-12-31'],
    altitude: 2,
    translateY: 60,
    text: 'They were flown to Rabat in 1978 to perform for King Hassan II’s birthday.',
  }],
  [{
    goto: 'Budapest, Hungary',
    dates: ['1979-08-13', '1979-08-19'],
    altitude: 2,
    translateY: 60,
    text: 'In Budapest in 1979, they had to cancel outdoor performances due to weather. —“When the Ailey Dancers Got Cold Feet”',
  }],
  [{
    goto: 'Kansas City, MO, USA',
    dates: ['1982-10-08', '1982-10-10'],
    altitude: 2,
    translateY: 60,
    text: '10 new dances were first performed in Kansas City, where AAADT established a regular residency beginning in 1982.',
  }],
  [{
    goto: 'Beijing, China',
    dates: ['1985-10-31', '1985-11-03'],
    altitude: 2,
    translateY: 60,
    text: 'Their 1985 lecture demonstrations in Beijing included pieces “whose steamy sensuality would not pass censorship for a regular public performance”. —State Department report',
  }],
  [{
    goto: 'Copenhagen, Denmark',
    dates: ['1986-09-02', '1986-09-07'],
    altitude: 2,
    translateY: 60,
    text: 'Copenhagen saw more pieces of AAADT’s repertory than any other international city during Ailey’s lifetime. In November 1989, Copenhagen was also the site of the last international performance before Ailey’s death.',
  }],
]
tours2.id = 2


const tours3 = [
  [{
    goto: 'New York City, NY, USA',
    dates: ['1958-03-30', '1958-03-30'],
    altitude: 2,
    translateY: 60,
    text: 'The first performance of AAADT on 30 March 1958 was on a mixed bill with choreography by both Ailey and former Dunham dancer Ernest Parham.',
  }],
  [{
    goto: 'Manila, Philippines',
    dates: ['1962-03-28', '1962-03-29'],
    altitude: 2,
    translateY: 60,
    text: 'While in Manila In 1962, AAADT took part in a two-night mixed bill with the local Filipinescas Dance Company, which, like AAADT, had also been founded in 1958.',
  }],
  [{
    //goto: 'Stamford, CT, USA',
    dates: ['1963-05-17', '1963-05-17'],
    altitude: 2,
    translateY: 60,
    translateX: -80,
    alt: {lat: 21, lng: -40}, // Original Stamford: {lat: 41.052778, lng: -73.538889}
    text: 'AAADT lent their talent to numerous benefits, including on a 1963 program with Voices, Inc. for the Stamford branch of the NAACP.',
  }],
  [{
    goto: 'New York City, NY, USA',
    dates: ['1964-03-22', '1964-03-22'],
    altitude: 2,
    translateY: 60,
    text: 'AAADT appeared at Spencer Memorial Church in 1964 as part of a mixed-bill vesper concert benefit for Martin Luther King and the Presbyterian Freedom Fund.',
  }],
  [{
    goto: 'Paris, France',
    dates: ['1966-06-15', '1966-06-19'],
    altitude: 2,
    translateY: 60,
    text: 'They join with the Harkness Ballet in Paris at the Festival du Marais, where Harkness performs the Ailey choreographies <i>Ariadne</i>, <i>After Eden</i>, and <i>Time out of Mind</i>.',
  }],
  [{
    goto: 'Los Angeles, CA, USA',
    dates: ['1969-07-14', '1969-07-20'],
    altitude: 2,
    translateY: 60,
    text: 'AAADT danced alongside the “champagne soul” quintet 5th Dimension at the Greek Theatre in 1969.',
  }],
  [{
    goto: 'Washington, D.C., USA',
    dates: ['1971-09-06', '1971-09-09'],
    altitude: 2,
    translateY: 60,
    text: 'Ailey choreographed Leonard Bernstein’s MASS - A Theatre Piece for Singers, Players and Dancers, bringing his entire company into the production, which premiered in the Opera House of The John F. Kennedy Center for the Performing Arts.',
  }],
  [{
    goto: 'New York City, NY, USA',
    dates: ['1973-11-27', '1973-11-29'], // Beginning of the stay
    altitude: 2,
    translateY: 60,
    text: 'AAADT’s galas often included members of the broader performance community. One of these in 1973 featured the philanthropists Rebekah Harkness, who performed a flamenco, and Doris Duke, who appeared with the gospel Angelic Choir. Dustin Hoffman was the emcee.',
  }],
  [{
    goto: 'Zürich, Switzerland',
    dates: ['1987-10-04', '1987-10-05'], // Beginning of the stay
    altitude: 2,
    translateY: 60,
    text: 'While AAADT performed in Zurich in 1987, Dudley Williams flew back to NYC with Ailey to perform the solo “A Song for You” as part of the AIDS Dancing for Life Gala at the New York State Theater.',
  }],
  [{
    goto: 'London, England',
    dates: ['1988-06-11', '1988-06-11'],
    altitude: 2,
    translateY: 60,
    text: 'AAADT company members performed live as part of a 10-hour broadcast from Wembley Arena as part of Nelson Mandela’s birthday celebration.',
  }],
]

const tourDict = {
  'tour-1': tours1,
  'tour-2': tours2,
  'tour-3': tours3,
}
var tours




























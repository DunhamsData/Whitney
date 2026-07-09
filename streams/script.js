// Parameters
//const queryString = window.location.search
//const urlParams = new URLSearchParams(queryString)
//const paramInt = parseFloat(urlParams.get('pInt')) || 10
//const paramFloat = parseFloat(urlParams.get('pFloat')) || 10.0
//const paramBoolean = urlParams.get('pBoolean') === 'true' || false

// Global variables and constants
//const WELCOME_AUDIO = new Audio('audio/fixed_DemoSample.mp3')
const WELCOME_AUDIO = new Audio('audio/audio_streams.wav')
WELCOME_AUDIO.loop = false
var PLAYWELCOME = false
const WELCOMEINTERVALTIME = 2000

// Load data and run scripts
//<script src="https://d3js.org/d3.v4.min.js"></script>
d3.queue()
.defer(d3.json, 'data/index_names.json')
.defer(d3.json, 'data/names_years.json')
.defer(d3.json, 'data/years_names.json')
.await(dataReady)

//<script src="https://d3js.org/d3.v7.min.js"></script>
//Promise.all([
//    d3.json('data/index_names.json'),
//    d3.json('data/names_years.json'),
//    d3.json('data/years_names.json')
//  ]).then(dataReady)

function dataReady(error, data1, data2, data3) { // v4
//function dataReady(data) { // v7
//  [data1, data2, data3] = data

  // Local variables and constants
  var highlightedStream
  var highlightedYear
  var selectedYear

  var ALLOWINTERACTION = true // no selected names or year
  
  var highlightedYearIds = new Set()
  var highlightedStreamIds = new Set()
  
  var selectedStreamIds = new Set()
  var selectedYearIds = new Set()
  var selectedNames = new Set()
  
  // Script
  const performerNames = []
  for (var i in data1) {
    var name = data1[i]
    if (isPerformerName(name) && !performerNames.includes(name))
      performerNames.push(name)
  }
  
  var namesYears = {} // = data2
  for (var i in data2) {
    var years = data2[i]
    var index
    index = years.indexOf(1957)
    if (index != -1)
      years.splice(index, 1)
    index = years.indexOf(2024)
    if (index != -1)
      years.splice(index, 1)
    namesYears[i] = years
  }
  
  var yearsNames = {} // = data3
  for (var i in data3) {
    if (i != 1957 && i != 2024)
      yearsNames[i] = data3[i]
  }
  
  const imagesDiv = document.getElementById('sg-imgs')
  for (var i=0; i<performerNames.length; i++) {
    var name = performerNames[i]
    var imgPath = 'img/streams/sg_' + name + '_stream.png'
    
    var image = new Image()
    image.src = imgPath
    
    var img = document.createElement('img')
    img.id = 'stream-' + name
    img.className = 'sg-img viz'
    img.decoding = 'async'
    img.src = imgPath
    imagesDiv.appendChild(img)
  }
  for (var i in yearsNames) {
    var year = i
    var imgPath = 'img/years/sg_' + year + '_year.png'
    
    var image = new Image()
    image.src = imgPath
    
    var img = document.createElement('img')
    img.id = 'year-' + year
    img.className = 'sg-img viz'
    img.decoding = 'async'
    img.src = imgPath
    imagesDiv.appendChild(img)
  }
  
  var polyNames = {}
  var formattedPolyNames = {}
  
  function getPolyName(polyId) {
    const aux = polyId.slice(18) // 'MyPolyCollection_ '.length
    const r = aux.endsWith(' _0') ? aux.slice(0, -3) : aux // ' _0'.length
    return r
  }
  
  const svgObject = document.getElementById('sg-svg')
  svgObject.addEventListener('load', function(event) {
    const svgObj = event.target
    const svgDoc = svgObj.contentDocument
    const svgElem = svgDoc.getElementsByTagName('svg')[0]
    const figure1 = svgElem.getElementById('figure_1')
    const axes1 = figure1.children[1]
    const gElems = axes1.children;
    
    for (var i=0; i<gElems.length; i++) {
      var e = gElems[i]
      var eId = e.id
      if (e.tagName == 'g' && eId.startsWith('MyPolyCollection_ ')) {
        var polyName = getPolyName(eId)
        polyNames[eId] = polyName
        formattedPolyNames[eId] = lastFirstToFull(polyName)
        
        if (isPerformerName(polyName)) {
          var clipPath = e.children[1]
          var useNode = clipPath.children[0]
          
          useNode.addEventListener('mouseover', fHi)
          useNode.addEventListener('touchstart', ev => {})
          function fHi(ev) {
            ev.preventDefault()
            const target = ev.target
            const id = target.parentElement.parentElement.id
            if (ALLOWINTERACTION) {
              highlightFromSVGStream(id)
              showTooltip(id)
              document.getElementById(polyNames[id]).classList.add('fake-hover')
            }
            else {
              const id2 = 'stream-' + polyNames[id]
              if (highlightedStreamIds.has(id2)) {
                showTooltip(id)
              }
            }
          }
          useNode.addEventListener('mouseleave', fBye)
          useNode.addEventListener('touchend', ev => {})
          function fBye(ev) {
            ev.preventDefault()
            const target = ev.target
            const id = target.parentElement.parentElement.id
            if (ALLOWINTERACTION) {
              document.getElementById(polyNames[id]).classList.remove('fake-hover')
            }
          }
          useNode.addEventListener('mousemove', fMove)
          useNode.addEventListener('touchmove', fMove2)
          function fMove(ev) {
            ev.preventDefault()
            const target = ev.target
            const id = target.parentElement.parentElement.id
            if (ALLOWINTERACTION) {
              moveTooltip(id, ev)
            }
            else {
              const id2 = 'stream-' + polyNames[id]
              if (highlightedStreamIds.has(id2)) {
                moveTooltip(id, ev)
              }
            }
          }
          function fMove2(ev) {
            ev.preventDefault()
            const touch = ev.touches[0]
            const useNode = svgDoc.elementFromPoint(touch.clientX, touch.clientY)
            useNode.dispatchEvent(new Event('mouseover'))
          
            if (ALLOWINTERACTION) {
              moveTooltip(null, touch)
            }
          }
          
          useNode.addEventListener('mousedown', fHello)
          //useNode.addEventListener('touchstart', ev => {})
          function fHello(ev) {
            ev.preventDefault()
            
            if (!ALLOWINTERACTION)
              clearHighlights()
            
            const target = ev.target
            const id = target.parentElement.parentElement.id
            selectionCore(ev, id, 'svg')
          }
        }
        // else if (isBorderName(polyName)) {} No longer border name (' _0') in polyNames
        else { // if (isBaseName(polyName)) {
          var clipPath = e.children[1]
          var useNode = clipPath.children[0]
          
          useNode.addEventListener('mouseover', function(ev) {
            ev.preventDefault()
            const target = ev.target
            const id = target.parentElement.parentElement.id
            if (selectedNames.size > 0) {
              hideTooltip()
              clearHighlights()
            }
            else if (ALLOWINTERACTION) {
              unhighlightFromSVG()
            }
            else {
              hideTooltip()
              if (highlightedYear != selectedYear)
                hideOne('year-' + highlightedYear)
            }
          })
          
          useNode.addEventListener('mousedown', function(ev) {
            ev.preventDefault()
            unhighlightFromSVG()
            clearSelection()
            ALLOWINTERACTION = true
          })
        }
      }
      else if (e.tagName == 'g' && eId == 'matplotlib.axis_1') {
        const axes = e.children;
        for (var j=1; j<axes.length-1; j++) { // excludes 1957 and 2024
          var xTick = axes[j]
          
          xTick.addEventListener('mouseover', function(ev) {
            ev.preventDefault()
            const useNode = ev.target
            const gElem = useNode.parentElement
            const gText = gElem.parentElement
            const textNode = gText.childNodes[1]
            const year = textNode.textContent.trim()
            if (ALLOWINTERACTION)
              highlightFromSVGYear(year)
            else {
              if (highlightedYear != selectedYear)
                hideOne('year-' + highlightedYear)
              showOne('year-' + year)
            }
            highlightedYear = year
          })
//          xTick.addEventListener('mouseleave', function(ev) {
//            //don't unhighlight here to prevent blinking from year to year
//          })
//          xTick.addEventListener('mousedown', function(ev) {
//            ev.preventDefault()
//            //
//          })
        }
//        e.addEventListener('mouseover', function(ev) {
//          ev.preventDefault()
//          //
//        })
//        e.addEventListener('mousedown', function(ev) {
//          ev.preventDefault()
//          //
//        })
//        e.addEventListener('mouseleave', function(ev) {
//          ev.preventDefault()
//          //
//        })
      }
    }
    svgElem.addEventListener('mouseover', function(event) {
      event.preventDefault()
      const target = event.target
      if (isTopSpace(target)) { // || isBaseStream(target)) {
        if (selectedNames.size > 0) {
          hideTooltip()
          clearHighlights()
        }
        else if (ALLOWINTERACTION) {
          unhighlightFromSVG()
        }
        else {
          hideTooltip()
          if (highlightedYear != selectedYear)
            hideOne('year-' + highlightedYear)
        }
      }
      else if (isYear(target)) {
//        console.log('YEAR')
      }
    })
    svgElem.addEventListener('mousedown', function(event) {
      event.preventDefault()
      const target = event.target
//      console.log(target)
      if (isPerformerStream(target)) {
//        console.log('Performer stream')
      }
      else if (isBorder(target)) {
//        console.log('Border')
      }
      else if (isYear(target)) {
//        console.log('Year')
        if (highlightedYear) {
          clearSelection()
          highlightFromSVGYear(highlightedYear)
          selectedYear = highlightedYear
          $('li.liPerformer').removeClass('selected')
          ALLOWINTERACTION = false
        }
      }
      else if (isBaseStream(target)) {
//        console.log('Base stream')
      }
      else if (isTopSpace(target)) {
//        console.log('Top')
        unhighlightFromSVG()
        clearSelection()
        ALLOWINTERACTION = true
      }
      else if (isSVG(target)) {
//        console.log('SVG')
        unhighlightFromSVG()
        clearSelection()
        ALLOWINTERACTION = true
      }
      else FAIL_CLICKED_ELEMENT_TYPE
      
//      if (ALLOWINTERACTION) {
//        unhighlightFromSVG()
//      }
    })
    showOne('sg-0-on')
    
    // const axes1 = figure1.children[1] // Previously defined
    const axes1Rect = axes1.getBoundingClientRect()
    const axes1Width = axes1Rect.width
    const axes1Height = axes1Rect.height
    
    const axis1 = axes1.children[1]
    const axis1Rect = axis1.getBoundingClientRect()
    const axis1Width = axis1Rect.width
    const axis1Height = axis1Rect.height
    
    const patch1 = figure1.children[0]
    const patch1Rect = patch1.getBoundingClientRect()
    const patch1Width = patch1Rect.width
    const patch1Height = patch1Rect.height
    
    $(patch1).css({
      'scale': `${axis1Width / patch1Width} ${axis1Height / patch1Height}`,
      'transform-origin': `50% ${axes1Height / patch1Height * 100}%`,
    })
  })
  
  svgObject.addEventListener('mouseleave', function(event) {
    event.preventDefault()
    if (selectedNames.size > 0) {
      hideTooltip()
      clearHighlights()
    }
    else if (ALLOWINTERACTION) {
      unhighlightFromSVG()
    }
  })
  
  const interfaceContent = document.getElementById('interface-content')
  interfaceContent.addEventListener('mouseover', function(event) {
    event.preventDefault()
    const target = event.target
    if (selectedNames.size > 0) {
      hideTooltip()
      clearHighlights()
    }
    else if (ALLOWINTERACTION) {
      unhighlightFromSVG()
    }
    else {
      hideTooltip()
      if (highlightedYear != selectedYear)
        hideOne('year-' + highlightedYear)
    }
  })
  interfaceContent.addEventListener('mousedown', function(event) {
    event.preventDefault()
//    console.log('Interface content')
    unhighlightFromSVG()
    clearSelection()
    ALLOWINTERACTION = true
  })
  
  function selectionCore(ev, id, from) {
    const name = from == 'svg' ? polyNames[id] : from == 'search' ? ev.target.id : FAILFROM
    if (ev.ctrlKey || ev.metaKey || ev.altKey || ev.shiftKey) {
      if (selectedNames.has(name))
        selectedNames.delete(name)
      else
        selectedNames.add(name)
    }
    else {
      // clear all and select one only if the stream wasn't already selected or, if it was, it wasn't the only one
      const c1 = selectedNames.has(name)
      const c2 = selectedNames.size == 1
      selectedNames.clear()
      if (!c1 || !c2)
        selectedNames.add(name)
    }
    
    selectFromSVGStream(selectedNames, id)
    
    $('li.liPerformer').removeClass('fake-hover')
    $('li.liPerformer').removeClass('selected')
    selectedNames.forEach(name => {
      document.getElementById(name).classList.add('selected')
    })
    
    ALLOWINTERACTION = true
  }
  
  function isStream(elem) {
    return elem.tagName == 'use' && elem.parentElement.parentElement.id.startsWith('MyPolyCollection_ ') && elem.parentElement.parentElement.parentElement.id == 'axes_1'
  }
  
  function isBaseStream(elem) {
    return isStream(elem) && elem.parentElement.parentElement.id == 'MyPolyCollection_ Stream'
  }
  
  function isBorder(elem) {
    return isStream(elem) && elem.parentElement.parentElement.id.endsWith(' _0')
  }
  
  function isPerformerStream(elem) {
    return isStream(elem) && !isBaseStream(elem) && !isBorder(elem)
  }
  
  function isTrueYear(elem) {
    return elem.tagName == 'use' && elem.parentElement.parentElement.parentElement.parentElement.id == 'matplotlib.axis_1'
  }
  
  function isFalseYear(elem) {
    return elem.tagName == 'path' && elem.parentElement.id == 'patch_1'
  }
  
  function isYear(elem) {
    return isTrueYear(elem) || isFalseYear(elem)
  }
  
  function isTopSpace(elem) {
    return elem.tagName == 'path' && elem.parentElement.id == 'patch_2'
  }
  
  function isSVG(elem) {
    return elem.tagName == 'svg'
  }
  
  function isBaseName(name) {
    return name == 'Stream'
  }
  
  function isBorderName(name) {
    return name.endsWith(' _0')
  }
  
  function isPerformerName(name) {
    return !isBaseName(name) && !isBorderName(name)
  }
  
  function showTooltip(id) {
    streamTooltip.textContent = formattedPolyNames[id]
    streamTooltip.style.visibility = 'visible'
  }
  
  function hideTooltip() {
    streamTooltip.textContent = '.'
    streamTooltip.style.visibility = 'hidden'
  }
  
  function moveTooltip(id, ev) {
    const x = ev.clientX
    const y = ev.clientY
    
    const widthTooltip = streamTooltip.getBoundingClientRect().width
    const rect = interfaceContent.getBoundingClientRect()
    const sidePanelVisible = $('#side-panel').hasClass('visible')
    const x2 = x + (!sidePanelVisible ? 0 : rect.left)
    const y2 = y - rect.height / 30
    var offsetX
    if (x2 - widthTooltip / 2 < rect.left + rect.width / 15) {
      offsetX = widthTooltip / 1.5
    }
    else if (x2 + widthTooltip / 2 > rect.right - rect.width / 6) {
      offsetX = -widthTooltip / 1.5
    }
    else {
      offsetX = 0
    }
    const x3 = x2 + offsetX
    streamTooltip.style.top = y2 + 'px'
    streamTooltip.style.left = x3 + 'px'
  }
  
  
  var CANCELCLOSESEARCH = false;
  
  function highlightFromSVGYear(year) {
    highlightYear(year)
//    closeSearch2()
  }
  
  function highlightYear(year) {
//    CANCELCLOSESEARCH = false
    
    hideOne('sg-0-on')
    showOne('sg-0-off')
    
    const yearId = 'year-' + year
    showOne(yearId)
    // Explanation for next line: a year is formed by four different
    // elements. As soon as you move from one digit to the next, the
    // current year gets unghighlighted (undesired action)
    hideMany(highlightedYearIds.difference(new Set([yearId]))) // hide previous years
    highlightedYearIds.clear()
    highlightedYearIds.add(yearId)
    
    const names = yearsNames[year]
    const currentStreamIds = new Set(names.map(name => 'stream-' + name))
    const newStreamIds = currentStreamIds.difference(highlightedStreamIds)
    const sameStreamIds = currentStreamIds.intersection(highlightedStreamIds)
    const oldStreamIds = highlightedStreamIds.difference(currentStreamIds)
    hideMany(oldStreamIds) // hide previous streams
    showMany(newStreamIds)
    highlightedStreamIds = newStreamIds.union(sameStreamIds)
  }
  
  function highlightFromSVGStream(id) {
    const name = polyNames[id]
    highlightName(name)
  }
  
  function highlightName(name) {
//    CANCELCLOSESEARCH = false
    
    hideOne('sg-0-on')
    showOne('sg-0-off')
    
    const streamId = 'stream-' + name
    hideMany(highlightedStreamIds) // hide previous streams first
    highlightedStreamIds.clear()
    // then add new stream id - similar idea to years above
    showOne(streamId)
    highlightedStreamIds.add(streamId)
    
    const years = namesYears[name]
    const currentYearIds = new Set(years.map(year => 'year-' + year))
    const newYearIds = currentYearIds.difference(highlightedYearIds)
    const sameYearIds = currentYearIds.intersection(highlightedYearIds)
    const oldYearIds = highlightedYearIds.difference(currentYearIds)
    hideMany(oldYearIds) // hide previous years
    showMany(newYearIds)
    highlightedYearIds = newYearIds.union(sameYearIds)
  }
  
  function clearHighlights() {
    hideMany(highlightedStreamIds)
    hideMany(highlightedYearIds)
    highlightedStreamIds.clear()
    highlightedYearIds.clear()
  }
  
  function unhighlightFromSVG() {
    showOne('sg-0-on')
    hideOne('sg-0-off')
    clearHighlights()
    hideTooltip()
    $('li.liPerformer').removeClass('selected')
  }
  
  function showMany(ids) {
    ids.forEach(id => showOne(id))
  }
  
  function hideMany(ids) {
    ids.forEach(id => hideOne(id))
  }
  
  function showOne(id) {
    document.getElementById(id).classList.add('visible')
  }
  
  function hideOne(id) {
    document.getElementById(id).classList.remove('visible')
  }
  
  function selectMany(ids) {
    ids.forEach(id => selectOne(id))
  }
  
  function unselectMany(ids) {
    ids.forEach(id => unselectOne(id))
  }
  
  function selectOne(id) {
    document.getElementById(id).classList.add('selected')
  }
  
  function unselectOne(id) {
    document.getElementById(id).classList.remove('selected')
  }
  
  function selectFromSVGStream(names, clickedId) {
    unselectOne('sg-0-on')
    selectOne('sg-0-off')
    
    const names2 = [...names]
    
    // Years
    const currentYearIds = new Set()
    names2.forEach(name => {
      const years = namesYears[name]
      years.forEach(year => currentYearIds.add('year-' + year))
    })
    const newYearIds = currentYearIds.difference(selectedYearIds)
    const sameYearIds = currentYearIds.intersection(selectedYearIds)
    const oldYearIds = selectedYearIds.difference(currentYearIds)
    unselectMany(oldYearIds) // hide previous years
    hideMany(oldYearIds)
    selectMany(newYearIds)
    selectedYearIds = newYearIds.union(sameYearIds)
    
    // Streams
    const currentStreamIds = new Set(names2.map(name => 'stream-' + name))
    const newStreamIds = currentStreamIds.difference(selectedStreamIds)
    const sameStreamIds = currentStreamIds.intersection(selectedStreamIds)
    const oldStreamIds = selectedStreamIds.difference(currentStreamIds)
    unselectMany(oldStreamIds) // hide previous streams
    hideMany(oldStreamIds)
    selectMany(newStreamIds)
    selectedStreamIds = newStreamIds.union(sameStreamIds)
    
    // Post-processing
    hideMany(oldStreamIds)
    const clickedName = polyNames[clickedId]
    const clickedId2 = 'stream-' + clickedName
    if (oldStreamIds.has(clickedId2))
      hideTooltip()
    else
      showTooltip(clickedId)
  }
  
  function clearSelection() {
    showOne('sg-0-on')
    hideOne('sg-0-off')
    unselectMany(selectedStreamIds)
    unselectMany(selectedYearIds)
    selectedStreamIds.clear()
    selectedYearIds.clear()
    selectedNames.clear()
  }
  
  document.getElementById('menu-icon').addEventListener('mousedown', function(ev) {
    $('#interface-content').toggleClass('left')
    $('#side-panel').toggleClass('visible')
  })
  
  function flashSearch() {
//    $('div.searchResults').addClass('flash')
//    $('li.liPerformer').addClass('flash')
  }
  
  
  
  
  
  
  
  
  function buildSearchBar() {
    var searchBar = document.getElementById('searchBar')
    $('#searchBar').show()
    
    var performers = performerNames
    performers.sort()
    
    var ul = document.getElementById('searchUL')
    ul.classList.add('ulPerformers')
    performers.forEach(function (x) {
      let li = document.createElement('li')
      //li.id = x[0]
      li.id = x
      li.classList.add('liPerformer')
      li.style.display = 'none'
      ul.appendChild(li)
      //li.innerHTML = '<a href="#" id="'+formatId(x)+'">'+x+'</a>'
      //li.innerHTML = x[1]
      li.innerHTML = x
      li.addEventListener('mouseover', function(ev) {
        ev.preventDefault()
        if (ALLOWINTERACTION) {
          const name = ev.target.id
          highlightName(name)
          
          $('#searchInput').blur()
        }
      })
      li.addEventListener('mouseout', function(ev) {
        ev.preventDefault()
        if (ALLOWINTERACTION) {
          li.classList.remove('noevents')
        }
      })
      li.addEventListener('mousedown', function(ev) {
        ev.preventDefault()
        
        if (!ALLOWINTERACTION)
          clearHighlights()
        
        selectionCore(ev, null, 'search')
        if (!selectedNames.has(li.id))
          li.classList.add('noevents')
        
        $('#searchInput').blur()
      })
      //var a = li.getElementsByTagName('a')[0]
      //a.addEventListener('mousedown', clickOnPerformer)
    })
    document.getElementById('searchInput').value = ''
    document.getElementById('searchCloseButton').addEventListener('click', function(ev) {
      closeSearch(ev)
      ALLOWINTERACTION = true
    })
    searchBar.addEventListener('keyup', searchPerformer)
    document.getElementById('searchInput').addEventListener('focusin', (ev) => {
      //if (paramTooltipSide)
        //closeSearch4()
      ALLOWINTERACTION = true
//      $('#searchCloseButton').css('opacity', 0.9)
      $('#searchCloseButton').addClass('active')
      $('#searchInput').addClass('active')
    })
    document.getElementById('searchInput').addEventListener('mouseover', (ev) => {
      //clearTimeout(unhighlightTimeout)
      CANCELCLOSESEARCH = true
      // it necessary both solutions in combination to stop the unhighlight
    })
//    document.getElementById('searchInput').addEventListener('mouseout', (ev) => {
//      $('#searchInput').blur()
//    })
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
  
  function closeSearch2() {
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
        if (txtValue.toUpperCase().indexOf(filter) == 0 || txtValue.toUpperCase().indexOf(', '+filter) > -1) {
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
  
  document.getElementById('play-pause-icon').addEventListener('mousedown', function(ev) {
    ev.preventDefault()
    commonWelcomeActions()
    if (PLAYWELCOME) {
      hiWelcome()
    }
    else {
      byeWelcome(true)
    }
  })
  
  let timerId = null;
  function startTimer(duration=48000) {
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
    hideTooltip()
    unhighlightFromSVG()
    
    $('#interface').toggleClass('welcome')
    $('#menu-icon').toggleClass('welcome')
    $('#side-panel').toggleClass('welcome')
    $('.band').toggleClass('welcome')
    $('#play-pause-icon').toggleClass('welcome')
    $('#play-pause-container').toggleClass('welcome')
    const svgDoc = svgObject.contentDocument
    svgDoc.documentElement.classList.toggle('welcome')
//    $('#timer').toggleClass('timer')
//    $('#mask').toggleClass('mask')
//    $('svg').toggleClass('circular-progress')
    $('#timer-svg').toggleClass('circular-progress-safari')
    if ($('#timer-svg').hasClass('circular-progress-safari')) {
      startTimer(48000)
    }
    
    // REVIEW THIS
    const style = document.createElement('style')
    style.textContent = '*.welcome { cursor: none; pointer-events: none; }'
    svgDoc.documentElement.appendChild(style)
    
    PLAYWELCOME = !PLAYWELCOME
    ALLOWINTERACTION = !PLAYWELCOME
  }
  
  document.body.onkeydown = function(ev) {
    // https://keycode.info/
    if (false) {}
    else if (ev.code == 'Escape') { // Escape
      ev.preventDefault()
      byeWelcome(true)
    }
  }
  
  function byeWelcome(stoppedByUser) {
    if (stoppedByUser) {
      WELCOME_AUDIO.pause()
      WELCOME_AUDIO.currentTime = 0
    }
    else {
      const timeLeft = 48 - WELCOME_AUDIO.currentTime
      if (timeLeft > 0) {
        setTimeout(() => {
        }, timeLeft * 1000)
      }
    }
    
    hideTooltip()
    clearHighlights()
    
    $('#interface').removeClass('welcome')
    $('#menu-icon').removeClass('welcome')
    $('#side-panel').removeClass('welcome')
    $('.band').removeClass('welcome')
    $('#play-pause-icon').removeClass('welcome')
    $('#play-pause-container').removeClass('welcome')
    const svgDoc = svgObject.contentDocument
    svgDoc.documentElement.classList.remove('welcome')
//    $('#timer').removeClass('timer')
//    $('#mask').removeClass('mask')
//    $('svg').removeClass('circular-progress')
    $('#timer-svg').removeClass('circular-progress-safari')
    cancelAnimationFrame(timerId)
    
//    const style = document.createElement('style')
//    style.textContent = '*.welcome { cursor: none; pointer-events: none; }'
//    svgDoc.documentElement.appendChild(style)
    
    PLAYWELCOME = false
    ALLOWINTERACTION = true
    
    $('#fake-cursor').removeClass('visible')
    
    closeSearch2()
    hideCustomTooltip()
    $('#interface-content').removeClass('left')
    $('#side-panel').removeClass('visible')
    unhighlightFromSVG()
  }
  
  var timestart, visitedYears
  function foo(timestamp) {
    if (!timestart)
      timestart = timestamp
    const timeElapsed = timestamp - timestart
    if (PLAYWELCOME && timeElapsed <= 17000 - WELCOMEINTERVALTIME) {
      var left = yearXScale(timeElapsed)
      $('#fake-cursor').css({left: `${left}%`})
      var year = Math.round(yearYearScale(timeElapsed))
      if (!visitedYears.has(year)) {
        highlightYear(year)
        visitedYears.add(year)
      }
      requestAnimationFrame(foo)
    }
    else if (PLAYWELCOME) {
      setTimeout(() => {
        unhighlightFromSVG()
      }, WELCOMEINTERVALTIME * 0.2)
      goToStreams()
    }
    else {
      byeWelcome(false)
    }
  }
  
//  function goToStream(i, t) {
//    var top, left, dup, streamName, d
//    [top, left, dup, streamName] = streamList[i]
//    if (dup == 'no')
//      return
//    else if (!dup)
//      d = t
//    else {
//      [top, left, dup, streamName] = streamList[i+1]
//      d = t * 2
//    }
//    $('#fake-cursor').animate({top: `${top}%`, left: `${left}%`}, d, 'linear')
//    if (i == 0)
//      moveTooltipWelcome(top - 2, left - 2)
//    else if (i < streamList.length)
//      moveTooltipWelcomeAnimate(top - 2, left - 2, d)
//    else {}
//    setTimeout(() => {
//      highlightName(streamName)
//      showTooltipWelcome(streamName)
//    }, t)
//  }
  
  function goToStream(i, t) {
    var top, left, dup, streamName
    [top, left, dup, streamName] = streamList[i]
    $('#fake-cursor').animate({top: `${top}%`, left: `${left}%`}, t, 'linear')
    if (i == 0)
      moveTooltipWelcome(top - 2, left - 2)
    else if (i < streamList.length)
      moveTooltipWelcomeAnimate(top - 2, left - 2, t)
    else {}
    setTimeout(() => {
      highlightName(streamName)
      showTooltipWelcome(streamName)
    }, t)
  }
  
//  function goToStream(i, t) {
//    var top, left, dup, streamName
//    [top, left, dup, streamName] = streamList[i]
//    $('#fake-cursor').animate({top: `${top}%`, left: `${left}%`}, t)
//    setTimeout(() => {
//      highlightName(streamName)
//      showTooltipWelcome(streamName)
//      if (i == 0)
//        moveTooltipWelcome(top - 2, left - 2)
//      else if (i < streamList.length - 1) {
//        var top2, left2, dup2, streamName2
//        [top2, left2, dup2, streamName2] = streamList[i+1]
//        moveTooltipWelcomeAnimate(top2 - 2, left2 - 2, t)
//      }
//      else {}
//    }, t)
//  }
  
  function hiWelcome() {
    clearSelection()
    $('#interface-content').removeClass('left')
    $('#side-panel').removeClass('visible')
    $('#fake-cursor').addClass('visible')
    WELCOME_AUDIO.play()
    
    goToYears()
  }
  
  function goToYears() {
    var top, left
    setTimeout(() => {
      if (PLAYWELCOME) {
        top = 83.5, left = 24.5
        $('#fake-cursor').animate({top: `${top}%`, left: `${left}%`}, WELCOMEINTERVALTIME)
      }
    }, 0)
    setTimeout(() => {
      if (PLAYWELCOME) {
        timestart = 0
        visitedYears = new Set([])
        requestAnimationFrame(foo)
      }
    }, WELCOMEINTERVALTIME)
  }
  
  function goToStreams() {
    var top, left
    setTimeout(() => {
      if (PLAYWELCOME) {
        top = 70.5, left = 58.5
        $('#fake-cursor').animate({top: `${top}%`, left: `${left}%`}, WELCOMEINTERVALTIME)
      }
    }, 0)
    setTimeout(() => {
      if (PLAYWELCOME) {
        const streamIntervalTime = WELCOMEINTERVALTIME * 6 / streamList.length
        var streamIntervalIndex = 0
        goToStream(streamIntervalIndex, streamIntervalTime)
        streamIntervalIndex++
        
        var streamInterval = setInterval(() => {
          if (PLAYWELCOME && streamIntervalIndex < streamList.length) {
            goToStream(streamIntervalIndex, streamIntervalTime)
            streamIntervalIndex++
          }
          else {
            clearInterval(streamInterval)
            top = 40
            left = 29
            $('#fake-cursor').animate({top: `${top}%`, left: `${left}%`}, WELCOMEINTERVALTIME * 0.5)
            setTimeout(() => {
              if (PLAYWELCOME) {
                unhighlightFromSVG()
              }
            }, WELCOMEINTERVALTIME * 0.5)
            setTimeout(() => {
              if (PLAYWELCOME) {
                goToSidePanel()
              }
            }, WELCOMEINTERVALTIME)
          }
        }, streamIntervalTime)
      }
    }, WELCOMEINTERVALTIME)
  }
  
  function goToSidePanel() {
    var top, left
    setTimeout(() => {
      if (PLAYWELCOME) {
        top = 12.4, left = 11.2
        $('#fake-cursor').animate({top: `${top}%`, left: `${left}%`}, WELCOMEINTERVALTIME)
      }
    }, 0)
    setTimeout(() => {
      if (PLAYWELCOME) {
        document.getElementById('menu-icon').dispatchEvent(new Event('mousedown'))
        goToSearch()
      }
    }, WELCOMEINTERVALTIME)
  }
  
  function goToSearch() {
    var top, left
    setTimeout(() => {
      if (PLAYWELCOME) {
        top = 29.5
        left = 13
        $('#fake-cursor').animate({top: `${top}%`, left: `${left}%`}, WELCOMEINTERVALTIME * 0.5)
      }
    }, WELCOMEINTERVALTIME)
    
    $('div.searchResults').show()
    setTimeout(() => {
      $('#searchInput').val('J'); $('li.liPerformer').hide(); $('li.liPerformer:contains(J)').show() }, WELCOMEINTERVALTIME * 1.6)
    setTimeout(() => {
      $('#searchInput').val('Ja'); $('li.liPerformer').hide(); $('li.liPerformer:contains(Ja)').show() }, WELCOMEINTERVALTIME * 1.7)
    setTimeout(() => {
      $('#searchInput').val('Jam'); $('li.liPerformer').hide(); $('li.liPerformer:contains(Jam)').show() }, WELCOMEINTERVALTIME * 1.9)
    setTimeout(() => {
      $('#searchInput').val('Jami'); $('li.liPerformer').hide(); $('li.liPerformer:contains(Jami)').show() }, WELCOMEINTERVALTIME * 2.0)
    setTimeout(() => {
      $('#searchInput').val('Jamis'); $('li.liPerformer').hide(); $('li.liPerformer:contains(Jamis)').show() }, WELCOMEINTERVALTIME * 2.2)
    setTimeout(() => {
      $('#searchInput').val('Jamiso'); $('li.liPerformer').hide(); $('li.liPerformer:contains(Jamiso)').show() }, WELCOMEINTERVALTIME * 2.4)
    setTimeout(() => {
      $('#searchInput').val('Jamison'); $('li.liPerformer').hide(); $('li.liPerformer:contains(Jamison)').show() }, WELCOMEINTERVALTIME * 2.5)
    
    setTimeout(() => {
      if (PLAYWELCOME) {
        top = 32.5
        left = 13.5
        $('#fake-cursor').animate({top: `${top}%`, left: `${left}%`}, WELCOMEINTERVALTIME * 0.4)
      }
    }, WELCOMEINTERVALTIME * 2.6)
    
    setTimeout(() => {
      if (PLAYWELCOME) {
        hideTooltip()
        highlightName('Jamison, Judith')
        $('li[id="Jamison, Judith"]').addClass('selected')
        setTimeout(() => {
          if (PLAYWELCOME) {
            goToVideo()
          }
        }, WELCOMEINTERVALTIME * 1)
      }
    }, WELCOMEINTERVALTIME * 3)
  }
  
  function goToVideo() {
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
//        tooltip.style.display = 'block'
        tooltip.style.visibility = 'visible'
        setTimeout(() => {
          if (PLAYWELCOME) {
            byeWelcome(false)
          }
        }, WELCOMEINTERVALTIME * 2)
      }
    }, WELCOMEINTERVALTIME * 0.5)
  }
  
  const yearYearScale = d3.scaleLinear().domain([0, 15000]).range([1964, 2014])
  const yearXScale = d3.scaleLinear().domain([0, 15000]).range([24.5, 72.5])
  const streamList = [
    [69.7, 58.2, false, 'Powell, Stephanie'],
    [69.1, 58.2, false, 'Barre, Lynn'],
    [68.9, 58.5, false, 'Rowley, Cheryl-Ann'],
    [68.3, 58.3, false, 'Sands, Uri'],
    [67.5, 58.3, false, 'Caceres, Linda'],
    [65.8, 57.5, false, 'Bolles, Mucuy'],
    [64.8, 57.2, false, 'Sandy, Solange'],
    [64.2, 57.5, false, 'Pouffer, Benoit-Swan'],
    [63.4, 57.5, false, 'Witter, Richard'],
    [62.6, 57.4, false, 'Gerodias, Jeffrey'],
//    [62.6, 56.0, false, 'Powell, Troy'],
    [61.7, 55.0, false, 'Meek, Leonard'],
    [61.0, 53.0, false, 'Roxas, Elizabeth'],
    [60.5, 52.7, false, 'Evans, Linda-Denise'],
    [60.0, 52.5, false, 'Pierce, Toni'],
    [59.0, 51.3, true, 'Allen, Sarita'], // dup
    [56.5, 49.7, 'no', 'Allen, Sarita'],
//    [58.5, 48.7, true, 'Ailey, Alvin'], // dup
    [58.0, 47.5, true, 'Ailey, Alvin'], // dup
//    [58.0, 46.0, 'no', 'Ailey, Alvin'],
    [57.0, 45.5, 'no', 'Ailey, Alvin'],
//    [56.5, 45.0, true, 'Williams, Dudley'], // dup
    [55.0, 45.0, true, 'Williams, Dudley'], // dup
//    [55.0, 44.0, 'no', 'Williams, Dudley'],
    [54.0, 44.0, 'no', 'Williams, Dudley'],
    [53.0, 43.7, false, 'Favors, Ronni'],
    [52.4, 43.6, true, 'Chaya, Masazumi'], // dup
    [51.7, 43.5, 'no', 'Chaya, Masazumi'],
    [50.0, 43.5, false, 'Robinson, Renee'],
    [49.0, 43.5, false, 'Barnett, Mary'],
    [48.0, 40.8, true, 'Jamison, Judith'], // dup
    [47.0, 38.0, 'no', 'Jamison, Judith'],
    [46.4, 35.9, false, 'Kajiwara, Mari'],
    [43.9, 33.5, false, 'Kent, Linda'],
    [42.8, 33.4, false, 'Oka, Michihiko'],
    [42.6, 33.0, false, 'Britten, Enid'],
    [42.4, 32.5, false, 'Spurlock, Estelle'],
    [42.4, 32.1, false, 'Yuan, Tina'],
    [42.2, 31.9, false, 'Mercado, Hector'],
    [42.2, 31.7, false, 'Barnes, Nerissa'],
    [42.1, 31.6, false, 'Sapiro, Dana'],
    [42.2, 31.3, false, 'Harper, Lee'],
    [41.5, 31.6, false, 'Ebbin, Michael'],
    [41.4, 31.6, false, 'Kimball, Christina'],
    [41.9, 31.1, false, 'Walker, Lynne Dell'],
  ]
  
  function showTooltipWelcome(name) {
    streamTooltip.textContent = name
    streamTooltip.style.visibility = 'visible'
  }
  
  function moveTooltipWelcome(top, left) {
    streamTooltip.style.top = top + '%'
    streamTooltip.style.left = left + '%'
  }
  
  function moveTooltipWelcomeAnimate(top, left, t) {
    $('#tooltip').animate({top: `${top}%`, left: `${left}%`}, t, 'linear')
  }
  
  function hideCustomTooltip() {
    const tooltip = document.getElementById('custom-tooltip')
    tooltip.textContent = '.'
    tooltip.style.visibility = 'hidden'
  }
  
  const streamTooltip = document.getElementById('tooltip')
  
  
  
  
  
  
  
  
  
//  $('document').ready(() => {
//    $('#years').mousedown(ev => {
//    })
//  })
  
  
  
  $('#yt-video').on('mouseover', ev => { ev.preventDefault(); })
  $('#video-link').on('mouseover', ev => { ev.preventDefault(); })
  
  function removeIntro(ev) {
    $('#play-pause-container.intro').removeClass('intro')
    $('#interface.intro').removeClass('intro')
    $('#intro').hide()
  }
  
  $('#play-pause-container.intro').on('mousedown', removeIntro)
  $('#intro').on('mousedown', removeIntro)
  setTimeout(() => { removeIntro() }, 4000)
}

$(() => {
  $('.draggable').draggable()
})

// Font size
function computeFontSizeAux(elem) {
  const fontSizePxString = window.getComputedStyle(elem).fontSize
  const fontSizePx = fontSizePxString.slice(0, -2)
  const fontSizePt = fontSizePx * 3 / 4
  const title = `${myRound(fontSizePx, 1)} px / ${myRound(fontSizePt, 1)} pt`
  return title
}
function computeFontSizeElem(elem) {
  return computeFontSizeAux(elem)
}
function computeFontSizeEvent(ev) {
  ev.preventDefault()
  const target = ev.target
  const title = computeFontSizeElem(target)
  target.setAttribute('title', title)
}
function computeFontSizeName(name) {
  const elem = document.getElementById(name)
  return computeFontSizeElem(elem)
}
//document.getElementById('desc-text').addEventListener('mouseover', computeFontSizeEvent)
//document.getElementById('credits').addEventListener('mouseover', computeFontSizeEvent)

//window.addEventListener('resize', processWindowSize)
//function processWindowSize(ev) {
//  ev.preventDefault()
//  const title = computeFontSizeName('desc-text')
//  console.log(title)
//}

// Key events
document.body.onkeydown = function(ev) {
  // https://keycode.info/
  if (false) {}
  else if (ev.code == 'KeyE' && ev.ctrlKey) { // E + CTRL
    ev.preventDefault()
    $('.bckgrnd').toggleClass('reveal')
  }
}

// Utils
function myRound(x, n) {
  const base = 10 ** n
  const r = Math.round(x * base) / base
  return r
}

function lastFirstToFull(name) {
  myAssert(name.split(',').length - 1 <= 1)
  myAssert(!name.includes(',') || name.includes(', '))
  if (name.includes(', ')) {
    [last, first] = name.split(', ')
    r = first + ' ' + last
  }
  else
    r = name
  return r
}

function myAssert(condition) {
  if (!condition) FAIL_ASSERTION
}




















































const ROTATION = 0
const MARGIN = {top: 0, right: 0, bottom: 0, left: 0}
const SCL = 0.98
//const WIDTH = window.innerWidth * SCL
const MAIN = document.getElementById('main-content')
const MAINRECT = MAIN.getBoundingClientRect()
const WIDTH0 = MAINRECT.width
const HEIGHT0 = MAINRECT.height
const WIDTH = WIDTH0 * SCL
const M = WIDTH * 0.01


//const WELCOME_AUDIO = new Audio('audio/arc_audio.mp3')
const WELCOME_AUDIO = new Audio('audio/audio_arc.wav')
WELCOME_AUDIO.loop = false
var PLAYWELCOME = false
const WELCOMEINTERVALTIME = 2000


var resizeTimer;

// Params
// https://visualizations.dunhamsdata.org/aa/arc/arc.html?width=16&height=6&scale=1&sizecriteria=degree&minfs=6&maxfs=10&minds=2&maxds=4&linewidth=0.5&darken=true&rot=false

// ?highlight=color&ailey=*ff0066&nonailey=*333

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

//const paramWidth = parseFloat(urlParams.get('width')) || 16
//console.log('width:', paramWidth);

//const paramHeight = parseFloat(urlParams.get('height')) || 6
//console.log('height:', paramHeight);

const paramScale = parseFloat(urlParams.get('scale')) || 1
//console.log('scale:', paramScale);

const paramMinFS = parseFloat(urlParams.get('minfs')) || 6 * WIDTH * 0.0006
//console.log('minfs:', paramMinFS);

const paramMaxFS = parseFloat(urlParams.get('maxfs')) || 18 * WIDTH * 0.0006
//console.log('maxfs:', paramMaxFS);

const paramMinDS = parseFloat(urlParams.get('minds')) || paramMinFS * 0.6
//console.log('minds:', paramMinDS);

const paramMaxDS = parseFloat(urlParams.get('maxds')) || paramMaxFS * 0.6
//console.log('maxds:', paramMaxDS);

const paramLineWidth = parseFloat(urlParams.get('linewidth')) || 0.5
//console.log('linewidth:', paramLineWidth);

const paramLineOpac = parseFloat(urlParams.get('lineopac')) || 0.6
//console.log('lineopac:', paramLineOpac);

const paramRadius = urlParams.get('radius') || 40
//console.log('radius:', paramRadius);



// OPTIONS
// * paletteName = 'choreographer' | 'Blues' | ... (see variable "palettes")
// * selectedNodeSortingFunctionName &
//   selectedNodeSizingFunctionName &
//   selectedNodeColoringFunctionName =
//     'first'                        | 'degree' | 'wdegree'         | 'years'                     | 'performances'                 | 'choreographer'
//     'first documented performance' | 'degree' | 'weighted degree' | 'number of years performed' | 'total number of performances' | 'choreographer'
// * selectedLinkColoringFunctionName = 'source' | 'target'
// * nodeColorLimits = range (default = [0, 1] | [50, 155])

function nodeOptions(param, val) {
  var r
  if (val == 'first')
    r = 'first documented performance'
  else if (val == 'degree')
    r = 'degree'
  else if (val == 'wdegree')
    r = 'weighted degree'
  else if (val == 'years')
    r = 'number of years performed'
  else if (val == 'performances')
    r = 'total number of performances'
  else if (val == 'choreographer')
    r = 'choreographer'
  else {
    if (param == 'sort')
      r = 'first documented performance'
    else if (param == 'size')
      r = 'degree'
    else { // (param == 'color')
      if (paramPaletteName == 'choreographer')
        r = 'choreographer'
      else
        r = 'degree'
    }
  }
  return r
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const paramPaletteName = urlParams.get('palette') || 'choreographer'
//console.log('palette:', paramPaletteName);

const paramSelectedNodeSortingFunctionName = nodeOptions('sort', urlParams.get('sort'))
//console.log('sort:', paramSelectedNodeSortingFunctionName);

const paramSelectedNodeSizingFunctionName = nodeOptions('size', urlParams.get('size'))
//console.log('size:', paramSelectedNodeSizingFunctionName);

const paramSelectedNodeColoringFunctionName = nodeOptions('color', urlParams.get('color'))
//console.log('color:', paramSelectedNodeColoringFunctionName);

const paramSelectedLinkColoringFunctionName = urlParams.get('link') || 'source'
//console.log('link:', paramSelectedLinkColoringFunctionName);

const paramMinLim = parseFloat(urlParams.get('minlim')) || 50
//console.log('minlim:', paramMinLim);

const paramMaxLim = parseFloat(urlParams.get('maxlim')) || 155
//console.log('maxlim:', paramMaxLim);

const paramAA = '#' + (urlParams.get('ailey') || 'ff0066') // original purple '#984ea3'
//console.log('ailey:', paramAA);

const paramNonAA = '#' + (urlParams.get('nonailey') || '333') // original orange '#ff7f00'
//console.log('nonailey:', paramNonAA);

const paramYearColor = '#' + (urlParams.get('yearcolor') || '333')
//console.log('yearcolor:', paramYearColor);

// Animation
const paramTransSpeed = parseInt(urlParams.get('speed')) || 3000
//console.log('transspeed:', paramTransSpeed);


var paletteName = paramPaletteName
var selectedNodeSortingFunctionName = paramSelectedNodeSortingFunctionName
var selectedNodeSizingFunctionName = paramSelectedNodeSizingFunctionName
var selectedNodeColoringFunctionName = paramSelectedNodeColoringFunctionName
var selectedLinkColoringFunctionName = paramSelectedLinkColoringFunctionName
var nodeColorLimits = paletteName == 'choreographer' ? [0, 1] : [paramMinLim, paramMaxLim]

var transitionSpeed = paramTransSpeed

var className = 'hover'
var selectedClassName = 'selected'

var globalVar
var globalPerformances


function assert(condition, message) {
  if (!condition) {
    throw message || 'Assertion failed';
  }
}

window.scrollTo({top:0})

$(document).ready(function() {
  
  // Activate Carousel
//  $("#myCarousel-Revelations").carousel({interval: 5000});
  
  
  
  
  
  
  var rotation = ROTATION
  var margin = MARGIN
  
//  d3.json('./data/arc_data.json').then(function(data) {

//  fetch('/arc-data')
//  .then(response => response.json())
//  .then(data => {
  
  
//  Promise.all([
//    fetch('/scrape').then(res => res.json()),
//    fetch('/arc-data').then(res => res.json())
//  ]).then(([scrapeData, data]) => {

  Promise.all([
    d3.json('data/arc_data_NADAC.json'),
    d3.json('data/img_data_NADAC.json'),
  ]).then(([arcData, imgData]) => {
    
    const imagesDiv = document.getElementById('box3')
    for (var k in imgData) {
      var pieceName = k
      var pieceSrc = 'img/' + imgData[pieceName]
      
      var image = new Image()
      image.src = pieceSrc
      
      var img = document.createElement('img')
      img.id = pieceName
      img.className = 'piece-img'
      img.src = pieceSrc
      imagesDiv.appendChild(img)
      
      img.addEventListener('contextmenu', e => e.preventDefault()); // Prevent download Mat 30, 2026 Final notes!
    }
    
    const data = arcData
    const pieceData = Object.fromEntries(
      arcData.nodes.map(({ id, ...rest }) => [id, rest])
    )
    
    const graph = createGraph(data)
    const nodesData = Object.fromEntries(
      graph.nodes.map(item => [item.id, item])
    )
    
    //var side = Math.min(window.innerWidth, window.innerHeight)
    var width = WIDTH
    var width2 = width// - margin.right - margin.left
    
    globalVar = {
      multiSelectedDict: Object.assign({}, ...graph.nodes.map((x) => ({[x.id]: false}))),
      multiSelectionList: [],
    }
    
//    x = d3.scalePoint(
//      graph.nodes.map(d => d.id).sort(d3.ascending),
//      [margin.left, width - margin.right]
//    )
    
    function arc(d) {
      const x1 = d.source.x;
      const x2 = d.target.x;
      const factor = d3.scalePow()
        .domain([1, 100])
        .range([1, 0.5])
        .exponent(-0.5)
      .clamp(true)(paramRadius)
      const r = Math.abs(x2 - x1) * factor;
//      return `M${x1},${nodeBaseLine - 4}A${r},${r} 0,0,${x1 < x2 ? 1 : 0} ${x2},${nodeBaseLine - 4}`;
      const arcShift = maxRadius*0.005
      return `M${x1},${nodeBaseLine - arcShift}A${r},${r} 0,0,${x1 < x2 ? 1 : 0} ${x2},${nodeBaseLine - arcShift}`;
    }
    
    // Node sizing
    const scales = labelRadiusDarknessScales(graph)
    const labelLinearScale = scales.labelLinearScale
    const radiusLinearScale = scales.radiusLinearScale
    
    //Node sorting (uneven spacing) and position
    const nodes = graph.nodes.sort(selectedNodeSortingFunction)
    var sumSizes = 0
    nodes.forEach(d => {var size = labelLinearScale(selectedNodeSizingFunction(d)); d.absSize = size; sumSizes += size})
    nodes.forEach(d => d.relSize = d.absSize / sumSizes)
    var cumXs = margin.left
    var unevenXs = []
    nodes.forEach(d => {var space = width2 * d.relSize; unevenXs.push(cumXs + space/2); cumXs += space})
    var unevenX = d3.scaleOrdinal(
      nodes.map(d => d.id),
      unevenXs
    )
    var x = unevenX
    x.domain(nodes.map(d => d.id))
    
    const links = graph.links
    var maxRadius = 0
    links.forEach(d => {
      var x1 = x(d.source);
      var x2 = x(d.target);
      var r = Math.abs(x2 - x1) * 0.55;
      maxRadius = r > maxRadius ? r : maxRadius
    })
//    var nodeBaseLine = d3.scaleLinear([1, 100], [220, 720]).clamp(true)
    var nodeBaseLine = maxRadius
    globalVar['nodeBaseLine'] = nodeBaseLine
    
    // Node coloring
    const nodeColor = nodeColoring(graph)
    
    // Link coloring
    // nothing here - they take source or target node color
    
    // Viz
    drawViz()
    
    function drawSvg() {
  //    d3.select('svg').remove()
  //    d3.select('g').remove()
      
      const x = 0 // width / 2
      const y = 0  // height / 2
      const r = rotation
      
      // Added to fit my laptop screen AJM
//      $('#myviz').css({
//        'transform-origin': 'top left',
//        'transform': `scale(${paramScale})`,
//      })
      
      d3.select('#myviz')
      .append('svg')
        .attr('id', 'mysvg')
        .attr('width', width)
        .attr('height', width)
      .append('g')
        .attr('transform', `translate(${x},${y}),rotate(${r})`)
      
      $('#mysvg').css({
        'transition': 'all 2s, height 0s',
        'transform-origin': 'top left',
      })
    }
    
    function drawNodesAndLabels() {
      var visitedYears = []
      
      //const svg = d3.select('svg')
      const svg = d3.select('#mysvg')
      const label = svg.append('g')
        .attr('id', 'labels')
        //.attr('font-family', 'sans-serif')
        .attr('text-anchor', 'end')
      .selectAll('g')
      .data(graph.nodes)
      .join('g')
        .attr('transform', d => `translate(${d.x = x(d.id)},${nodeBaseLine}),rotate(-90)`)
        .call(g => g.append('text')
          .attr('x', -(maxRadius*0.014))
          .attr('y', 0)
          .attr('dy', '0.3em')
          .attr('fill', d => nodeColor(selectedNodeColoringFunction(d)))
          .text(d => d.id)
          .attr('font-size', (d, i) => {
            const s = selectedNodeSizingFunction(d);
            return labelLinearScale(s) + 'pt';
          })
        )
        .call(g => g.append('circle')
          .attr('r', (d, i) => {
            const s = selectedNodeSizingFunction(d);
            return radiusLinearScale(s);
          })
          .attr('fill', d => nodeColor(selectedNodeColoringFunction(d)))
        );
      
      return label
    }
    
    function drawPaths() {
      //const svg = d3.select('svg')
      const svg = d3.select('#mysvg')
      const path = svg.insert('g', '*')
        .attr('id', 'lines')
        .attr('fill', 'none')
        .attr('stroke-opacity', paramLineOpac)
//        .attr('stroke-width', paramLineWidth)
      .selectAll('path')
      .data(graph.links)
      .join('path')
        .attr('stroke', d => {
          var r
          const sortVal = selectedNodeSortingFunction(d.source, d.target)
          const sourceNode = sortVal <= 0 ? d.source : d.target
          const targetNode = sortVal <= 0 ? d.target : d.source
          const src = selectedNodeColoringFunction(sourceNode);
          const tar = selectedNodeColoringFunction(targetNode);
          if (selectedLinkColoringFunctionName == 'source')
            r = nodeColor(src);
          else if (selectedLinkColoringFunctionName == 'target')
            r = nodeColor(tar);
          else {
            assert(false)
          }
          return r;
        })
        .attr('d', arc)
        .raise()
      return path
    }
    
    function addInteractivity(label, path) {
      //const svg = d3.select('svg')
      const svg = d3.select('#mysvg')
      const overlay = svg.append('g')
        .attr('id', 'interaction')
        .attr('fill', 'none')
        .attr('pointer-events', 'all')
      .selectAll('rect')
      .data(graph.nodes)
      .join('rect')
        .attr('transform', d => `translate(0,${nodeBaseLine - 12})`)
        .attr('width', d => width2 * d.relSize * (false ? 0.8 : 1))
        .attr('height', (d, i) => {
          const textElem = $(`text:contains(${d.id})`)
          const textHeight = textElem[0].getBoundingClientRect().height
          return textHeight + 12*2
        })
        .attr('x', d => x(d.id) - (width2 * d.relSize * 0.4))
        .attr('y', (d, i) => 0)
        .attr('fill', false ? '#0000ff22' : null)
        .on('mouseover', (ev, d) => {
          if (INTERACTION && !PLAYWELCOME) {
            if (!ev.shiftKey) {
              svg.classed(className, true);
              label.classed('primary', n => isPrimaryLabel(n, d));
              label.classed('secondary', n => isSecondaryLabel(n, d));
              path.classed('primary', n => isPrimaryPath(n, d)).filter('.primary').raise();
            }
            else {
              var r = applyMultiSelectionActions(ev, d)
              svg.classed(selectedClassName, globalVar.anyMultiSelected);
              label.classed('selected-primary', n => isSelectedPrimaryLabel(n, d));
              label.classed('selected-secondary', n => isSelectedSecondaryLabel(n, d));
              path.classed('selected-primary', n => isSelectedPrimaryPath(n, d)).filter('.selected-primary').raise();
              
              if (!r) {
                svg.classed(className, false);
                label.classed('primary', false);
                label.classed('secondary', false);
                path.classed('primary', false).order();
              }
            }
            displayPieceInformation(d.id)
            $(`li[id="${d.id}"]`).addClass('fake-hover')
          }
        })
        .on('mouseout', (ev, d) => {
          if (!PLAYWELCOME) {
            svg.classed(className, false);
            label.classed('primary', false);
            label.classed('secondary', false);
            path.classed('primary', false).order();
            $(`li[id="${d.id}"]`).removeClass('fake-hover')
            if (!globalVar.multiSelectionList.length) {
              hidePieceInformation()
            }
            else {
              displayPieceInformation(globalVar.multiSelectionList[globalVar.multiSelectionList.length-1])
            }
          }
        })
        .on('mousedown', (ev, d) => {
          if (!PLAYWELCOME) {
            var r = applyMultiSelectionActions(ev, d)
            svg.classed(selectedClassName, globalVar.anyMultiSelected);
            label.classed('selected-primary', n => isSelectedPrimaryLabel(n, d));
            label.classed('selected-secondary', n => isSelectedSecondaryLabel(n, d));
            path.classed('selected-primary', n => isSelectedPrimaryPath(n, d)).filter('.selected-primary').raise();
            
            if (!r) {
              svg.classed(className, false);
              label.classed('primary', false);
              label.classed('secondary', false);
              path.classed('primary', false).order();
            }
            
            if (!globalVar.multiSelectionList.length) {
              hidePieceInformation()
            }
            else {
              displayPieceInformation(globalVar.multiSelectionList[globalVar.multiSelectionList.length-1])
            }
          }
        });
      
      svg.on('mousedown', (ev, d) => {
        if (ev.target.tagName != 'rect' && !PLAYWELCOME) {
//          $('svg').removeClass(`${className} ${selectedClassName}`)
//          $('g').removeClass('primary secondary selected-primary selected-secondary')
//          $('path').removeClass('primary secondary selected-primary selected-secondary')
//          $('circle').removeClass('primary secondary selected-primary selected-secondary')
//          $('text').removeClass('primary secondary selected-primary selected-secondary')
        
          svg.classed(className, false);
          label.classed('primary', false);
          label.classed('secondary', false);
          path.classed('primary', false).order();
          
          svg.classed(selectedClassName, false);
          label.classed('selected-primary', false);
          label.classed('selected-secondary', false);
          path.classed('selected-primary', false).order();
          
          resetMultiSelection()
          hidePieceInformation()
        }
      })
      
      myviz = d3.select('#myviz')
      myviz.on('mousedown', (ev, d) => {
        if (ev.target.tagName != 'rect' && !PLAYWELCOME) {
//          $('svg').removeClass(`${className} ${selectedClassName}`)
//          $('g').removeClass('primary secondary selected-primary selected-secondary')
//          $('path').removeClass('primary secondary selected-primary selected-secondary')
//          $('circle').removeClass('primary secondary selected-primary selected-secondary')
//          $('text').removeClass('primary secondary selected-primary selected-secondary')
        
          svg.classed(className, false);
          label.classed('primary', false);
          label.classed('secondary', false);
          path.classed('primary', false).order();
          
          svg.classed(selectedClassName, false);
          label.classed('selected-primary', false);
          label.classed('selected-secondary', false);
          path.classed('selected-primary', false).order();
          
          resetMultiSelection()
          hidePieceInformation()
        }
      })
      
      
      function updateOrder(svg, label, path, overlay, selectedNodeSortingFunction) {
        const nodes = graph.nodes.sort(selectedNodeSortingFunction)
        sumSizes = 0
        nodes.forEach(d => {size = labelLinearScale(selectedNodeSizingFunction(d)); d.absSize = size; sumSizes += size})
        nodes.forEach(d => d.relSize = d.absSize / sumSizes)
        cumXs = margin.left
        unevenXs = []
        nodes.forEach(d => {space = width2 * d.relSize; unevenXs.push(cumXs + space/2); cumXs += space})
        unevenX = d3.scaleOrdinal(
          nodes.map(d => d.id),
          unevenXs
        )
        x = unevenX
        x.domain(nodes.map(d => d.id))
        
        //nodeBaseLine = globalVar['nodeBaseLine']

        const t = svg.transition()
            .duration(transitionSpeed)

        label.transition(t)
            .delay((d, i) => i * 20)
            .attrTween("transform", d => {
              const i = d3.interpolateNumber(d.x, x(d.id));
              //return t => `translate(${nodeBaseLine},${d.x = i(t)})`;
              return t => `translate(${d.x = i(t)},${nodeBaseLine}),rotate(-90)`;
            })

        path.transition(t)
            .duration(transitionSpeed + graph.nodes.length * 20)
            .attrTween("d", d => () => arc(d))

        overlay.transition(t)
            .delay((d, i) => i * 20)
            .attr("x", d => x(d.id) - (width2 * d.relSize * 0.4))
        
        INTERACTION = false
        setTimeout(() => {INTERACTION = true}, transitionSpeed + graph.nodes.length * 20)
      }
      
      var ROTATED = 0
      var VISIBLE = false
      var INTERACTION = true
      
      document.body.onkeydown = function(ev) {
        // https://keycode.info/
        if (false) {}
        else if (ev.code == 'Digit1') { // 1
          ev.preventDefault()
          selectedNodeSortingFunctionName = 'name'
          selectedNodeSortingFunctionIndex = nodeSortingFunctionNames.indexOf(selectedNodeSortingFunctionName)
          selectedNodeSortingFunction = nodeSortingFunctions[selectedNodeSortingFunctionIndex].f
          updateOrder(svg, label, path, overlay, selectedNodeSortingFunction)
        }
        else if (ev.code == 'Digit2') { // 2 (default)
          ev.preventDefault()
          selectedNodeSortingFunctionName = 'first documented performance'
          selectedNodeSortingFunctionIndex = nodeSortingFunctionNames.indexOf(selectedNodeSortingFunctionName)
          selectedNodeSortingFunction = nodeSortingFunctions[selectedNodeSortingFunctionIndex].f
          updateOrder(svg, label, path, overlay, selectedNodeSortingFunction)
        }
        else if (ev.code == 'Digit3') { // 3
          ev.preventDefault()
          selectedNodeSortingFunctionName = 'degree'
          selectedNodeSortingFunctionIndex = nodeSortingFunctionNames.indexOf(selectedNodeSortingFunctionName)
          selectedNodeSortingFunction = nodeSortingFunctions[selectedNodeSortingFunctionIndex].f
          updateOrder(svg, label, path, overlay, selectedNodeSortingFunction)
        }
        else if (ev.code == 'Digit4') { // 4
          ev.preventDefault()
          selectedNodeSortingFunctionName = 'weighted degree'
          selectedNodeSortingFunctionIndex = nodeSortingFunctionNames.indexOf(selectedNodeSortingFunctionName)
          selectedNodeSortingFunction = nodeSortingFunctions[selectedNodeSortingFunctionIndex].f
          updateOrder(svg, label, path, overlay, selectedNodeSortingFunction)
        }
        else if (ev.code == 'Digit5') { // 5
          ev.preventDefault()
          selectedNodeSortingFunctionName = 'number of years performed'
          selectedNodeSortingFunctionIndex = nodeSortingFunctionNames.indexOf(selectedNodeSortingFunctionName)
          selectedNodeSortingFunction = nodeSortingFunctions[selectedNodeSortingFunctionIndex].f
          updateOrder(svg, label, path, overlay, selectedNodeSortingFunction)
        }
        else if (ev.code == 'Digit6') { // 6
          ev.preventDefault()
          selectedNodeSortingFunctionName = 'total number of performances'
          selectedNodeSortingFunctionIndex = nodeSortingFunctionNames.indexOf(selectedNodeSortingFunctionName)
          selectedNodeSortingFunction = nodeSortingFunctions[selectedNodeSortingFunctionIndex].f
          updateOrder(svg, label, path, overlay, selectedNodeSortingFunction)
        }
        else if (ev.code == 'Keys' && ev.ctrlKey) { // S
          ev.preventDefault()
          ROTATED = (ROTATED + 1) % 5
          ROTATED == 0 ? rotate0() : ROTATED == 1 ? rotate1() : ROTATED == 2 ? rotate2() : ROTATED == 3 ? rotate3() : ROTATED == 4 ? rotate4() : fail
          INTERACTION = false
          setTimeout(() => {INTERACTION = true}, 2000)
        }
        else if (ev.code == 'KeyD' && ev.ctrlKey) { // D
          ev.preventDefault()
          VISIBLE = !VISIBLE
          VISIBLE ? $('rect').css('fill', '#0000ff22') : $('rect').css('fill', 'unset')
        }
        else if (ev.code == 'Digit7') { // 7
          ev.preventDefault()
          $('body').addClass('black')
          $('body').removeClass('pink')
        }
        else if (ev.code == 'Digit8') { // 8
          ev.preventDefault()
          $('body').removeClass('black')
          $('body').addClass('pink')
        }
        else if (ev.code == 'Digit9') { // 9
          ev.preventDefault()
          $('body').removeClass('black')
          $('body').removeClass('pink')
        }
        else if (ev.code == 'KeyY' && ev.ctrlKey) { // Y
          ev.preventDefault()
          $('.layoutable').toggleClass('layout')
        }
        else if (ev.code == 'Escape') { // Escape
          ev.preventDefault()
          byeWelcome(true)
        }
      }
      
      
      
      ////////////////////////////////////////////////////////////////////////////
      // FONT SIZE
      ////////////////////////////////////////////////////////////////////////////
      $('#dropdownmenu-size').mouseover(ev => {
        ev.preventDefault()
        $('#dropdownmenu-size .dropdown-content').css('display', '')
      })
      $('#dropdownmenu-size .dropdown-content span').mousedown(ev => {
        ev.preventDefault()
        $('.resizable-text').removeClass('small')
        $('.resizable-text').removeClass('medium')
        $('.resizable-text').removeClass('large')
        $('.resizable-text').addClass(ev.target.id)
        $('#dropdownmenu-size .dropdown-content').css('display', 'none')
      })
      
      
      
      ////////////////////////////////////////////////////////////////////////////
      // SORTING NODES & ARCS
      ////////////////////////////////////////////////////////////////////////////
//      document.getElementById('menu-icon').addEventListener('mousedown', function(ev) {
//        $('#interface-content').toggleClass('left');
//        $('#side-panel').toggleClass('visible');
//        $('#box4').toggleClass('visible');
//      })
      
      $('#dropdownmenu-sort').mouseover(ev => {
        ev.preventDefault()
        $('#dropdownmenu-sort .dropdown-content').css('display', '')
      })
      $('#dropdownmenu-sort .dropdown-content span').mousedown(ev => {
        ev.preventDefault()
        selectedNodeSortingFunctionName = ev.target.id
        selectedNodeSortingFunctionIndex = nodeSortingFunctionNames.indexOf(selectedNodeSortingFunctionName)
        selectedNodeSortingFunction = nodeSortingFunctions[selectedNodeSortingFunctionIndex].f
        updateOrder(svg, label, path, overlay, selectedNodeSortingFunction)
        $('#dropdownmenu-sort .dropdown-content').css('display', 'none')
      })
      
      ////////////////////////////////////////////////////////////////////////////
      // GENERIC DROPDOWN MENU BEHAVIOUR
      ////////////////////////////////////////////////////////////////////////////
      $('.dropdown .dropdown-content span').mousedown(ev => {
        $('.dropdown .dropdown-content span').removeClass('selected')
        $(ev.target).addClass('selected')
        
        ev.target.parentElement.parentElement.children[2].textContent = ev.target.textContent
      })
      
      
      
      ////////////////////////////////////////////////////////////////////////////
      // SEARCH BAR
      ////////////////////////////////////////////////////////////////////////////
      function buildSearchBar() {
        var searchBar = document.getElementById('searchBar')
        $('#searchBar').show()
        
        var performers = Object.keys(imgData)
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
            const name = ev.target.id
            if (ALLOWINTERACTION && !PLAYWELCOME) {
              const d = nodesData[name]
              svg.classed(className, true);
              label.classed('primary', n => isPrimaryLabel(n, d));
              label.classed('secondary', n => isSecondaryLabel(n, d));
              path.classed('primary', n => isPrimaryPath(n, d)).filter('.primary').raise();
              displayPieceInformation(name)
            }
          })
          li.addEventListener('mouseout', function(ev) {
            if (ALLOWINTERACTION && !PLAYWELCOME) {
              svg.classed(className, false);
              label.classed('primary', false);
              label.classed('secondary', false);
              path.classed('primary', false).order();
              
              li.classList.remove('noevents')
              if (!globalVar.multiSelectionList.length)
                hidePieceInformation()
              else
                displayPieceInformation(globalVar.multiSelectionList[globalVar.multiSelectionList.length-1])
            }
          })
          li.addEventListener('mousedown', function(ev) {
            const name = ev.target.id
            if (INTERACTION && !PLAYWELCOME) {
              const d = nodesData[name]
              var r = applyMultiSelectionActions(ev, d)
              svg.classed(selectedClassName, globalVar.anyMultiSelected);
              label.classed('selected-primary', n => isSelectedPrimaryLabel(n, d));
              label.classed('selected-secondary', n => isSelectedSecondaryLabel(n, d));
              path.classed('selected-primary', n => isSelectedPrimaryPath(n, d)).filter('.selected-primary').raise();
              
              if (!r) {
                svg.classed(className, false);
                label.classed('primary', false);
                label.classed('secondary', false);
                path.classed('primary', false).order();
              }
              
              if (!globalVar.multiSelectedList.includes(li.id))
                li.classList.add('noevents')
              
              if (!globalVar.multiSelectionList.length) {
                hidePieceInformation()
              }
              else {
                displayPieceInformation(globalVar.multiSelectionList[globalVar.multiSelectionList.length-1])
              }
            }
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
//          $('#searchCloseButton').css('opacity', 0.9)
          $('#searchCloseButton').addClass('active')
          $('#searchInput').addClass('active')
        })
        document.getElementById('searchInput').addEventListener('mouseover', (ev) => {
          //clearTimeout(unhighlightTimeout)
          CANCELCLOSESEARCH = true
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
      
      function closeSearch2() {
        document.getElementById('searchInput').value = ''
//        $('#searchCloseButton').css('opacity', 0)
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
      ////////////////////////////////////////////////////////////////////////////
      
      function highlightByColor(director) {
        if (director != 'AA' && director != 'nonAA') { FAIL }
        
        resetMultiSelection()
        hidePieceInformation()
        
        svg.classed(className, false);
        label.classed('primary', false);
        label.classed('secondary', false);
        path.classed('primary', false).order();
          
        svg.classed(selectedClassName, false);
        label.classed('selected-primary', false);
        label.classed('selected-secondary', false);
        path.classed('selected-primary', false).order();
        
        svg.classed(className, true);
        label.classed('primary', n => n.choreographer == director);
        label.classed('secondary', n => n.choreographer == director);
        path.classed('primary-legend', n => n.source.choreographer == director).filter('.primary-legend').raise();
      }
      
      function unhighlightByColor() {
        resetMultiSelection()
        hidePieceInformation()
        
        svg.classed(className, false);
        label.classed('primary', false);
        label.classed('secondary', false);
        path.classed('primary', false).order();
          
        svg.classed(selectedClassName, false);
        label.classed('selected-primary', false);
        label.classed('selected-secondary', false);
        path.classed('selected-primary', false).order();
        
        path.classed('primary-legend', false).order();
      }
      
      // LEGEND
      const aaPieces = graph.nodes.filter(d => d.choreographer == 'AA')
      const nonaaPieces = graph.nodes.filter(d => d.choreographer == 'nonAA')
      
      document.getElementById('legend-row-1').addEventListener('mouseover', function(ev) {
        if (!PLAYWELCOME) {
          ev.preventDefault()
          highlightByColor('AA')
        }
      })
      document.getElementById('legend-row-1').addEventListener('mouseleave', function(ev) {
        if (!PLAYWELCOME) {
          ev.preventDefault()
          unhighlightByColor()
        }
      })
      document.getElementById('legend-row-2').addEventListener('mouseover', function(ev) {
        if (!PLAYWELCOME) {
          ev.preventDefault()
          highlightByColor('nonAA')
        }
      })
      document.getElementById('legend-row-2').addEventListener('mouseleave', function(ev) {
        if (!PLAYWELCOME) {
          ev.preventDefault()
          unhighlightByColor()
        }
      })
      
      
      
      ////////////////////////////////////////////////////////////////////////////
      // WELCOME
      ////////////////////////////////////////////////////////////////////////////
      
      //document.getElementById('play-pause-icon').addEventListener('mousedown', function(ev) {
      document.getElementById('play-pause-icon').addEventListener('click', function(ev) {
        ev.preventDefault()
        commonWelcomeActions()
        if (PLAYWELCOME) {
          hiWelcome()
        }
        else {
          byeWelcome(true)
        }
      })
      
      document.addEventListener('touchstart', () => { // Extra safety for audio on touch screens
        WELCOME_AUDIO.play().then(() => {
          WELCOME_AUDIO.pause()
          WELCOME_AUDIO.currentTime = 0
        }).catch(() => {})
      }, { once: true })
      
      let timerId = null;
      function startTimer(duration=64000) {
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
        resetMultiSelection()
        hidePieceInformation()
        
        svg.classed(className, false);
        label.classed('primary', false);
        label.classed('secondary', false);
        path.classed('primary', false).order();
          
        svg.classed(selectedClassName, false);
        label.classed('selected-primary', false);
        label.classed('selected-secondary', false);
        path.classed('selected-primary', false).order();
        
        $('#interface').toggleClass('welcome')
        $('#menu-icon').toggleClass('welcome')
        $('#side-panel').toggleClass('welcome')
        $('.band').toggleClass('welcome')
        $('#play-pause-icon').toggleClass('welcome')
        $('#play-pause-container').toggleClass('welcome')
        $('#mysvg').toggleClass('welcome')
//        $('#timer').toggleClass('timer')
//        $('#mask').toggleClass('mask')
        $('#timer-svg').toggleClass('circular-progress-safari')
        if ($('#timer-svg').hasClass('circular-progress-safari')) {
          startTimer(64000)
        }
        
        PLAYWELCOME = !PLAYWELCOME
        ALLOWINTERACTION = !PLAYWELCOME
        INTERACTION = ALLOWINTERACTION
      }
      
      function hiWelcome() {
        $('#dropdownmenu-sort .dropdown-content span:nth-child(1)').addClass('selected')
        $('#dropdownmenu-sort .dropdown-content span').removeClass('fake-hover')
        selectedNodeSortingFunctionName = 'first documented performance'
        selectedNodeSortingFunctionIndex = nodeSortingFunctionNames.indexOf(selectedNodeSortingFunctionName)
        selectedNodeSortingFunction = nodeSortingFunctions[selectedNodeSortingFunctionIndex].f
        updateOrder(svg, label, path, overlay, selectedNodeSortingFunction)
        
        $('.leftable').removeClass('left');
        $('#side-panel').removeClass('visible')
        $('#fake-cursor').addClass('visible')
        WELCOME_AUDIO.play()
        
//        goToArcs()
//        goToArcs2()
        goToNodes()
      }
      
      function byeWelcome(stoppedByUser) {
        
        resetMultiSelection()
        hidePieceInformation()
        
        svg.classed(className, false);
        label.classed('primary', false);
        label.classed('secondary', false);
        path.classed('primary', false).order();
          
        svg.classed(selectedClassName, false);
        label.classed('selected-primary', false);
        label.classed('selected-secondary', false);
        path.classed('selected-primary', false).order();
        
        selectedNodeSortingFunctionName = 'first documented performance'
        selectedNodeSortingFunctionIndex = nodeSortingFunctionNames.indexOf(selectedNodeSortingFunctionName)
        selectedNodeSortingFunction = nodeSortingFunctions[selectedNodeSortingFunctionIndex].f
        updateOrder(svg, label, path, overlay, selectedNodeSortingFunction)
        
        $('#interface').removeClass('welcome')
        $('#menu-icon').removeClass('welcome')
        $('#side-panel').removeClass('welcome')
        $('.band').removeClass('welcome')
        $('#play-pause-icon').removeClass('welcome')
        $('#play-pause-container').removeClass('welcome')
        $('#mysvg').removeClass('welcome')
//        $('#timer').removeClass('timer')
//        $('#mask').removeClass('mask')
        $('#timer-svg').removeClass('circular-progress-safari')
        cancelAnimationFrame(timerId)
        
        if (stoppedByUser) {
          WELCOME_AUDIO.pause()
          WELCOME_AUDIO.currentTime = 0
        }
        else {
          const timeLeft = 64 - WELCOME_AUDIO.currentTime
          if (timeLeft > 0) {
            setTimeout(() => {
            }, timeLeft * 1000)
          }
        }
        
    //    const style = document.createElement('style')
    //    style.textContent = '*.welcome { cursor: none; pointer-events: none; }'
    //    svgDoc.documentElement.appendChild(style)
        
        //setTimeout(() => { May 30, 2026 Final notes!
          PLAYWELCOME = false
          ALLOWINTERACTION = true
          INTERACTION = true
        //}, WELCOMEINTERVALTIME) May 30, 2026 Final notes!
        
        $('#fake-cursor').removeClass('visible')
        
        hideCustomTooltip()
        $('.leftable').removeClass('left');
        $('#side-panel').removeClass('visible')
        hidePieceInformation()
        
        
//        $('#searchCloseButton').removeClass('active')
//        $('#searchInput').removeClass('active')
        closeSearch2()
        
        $('#dropdownmenu-sort .dropdown-content').css('display', 'none')
        $('#dropdownmenu-sort .dropdown-content').css('display', '')
        $('#dropdownmenu-sort .dropdown-content span').removeClass('fake-hover')
        $('#dropdownmenu-sort .dropdown-content span').removeClass('selected')
        $('#dropdownmenu-sort .dropdown-content span:nth-child(1)').addClass('selected')
      }
      
//      function goToArcs() {
//        var top, left
//        setTimeout(() => {
//          if (PLAYWELCOME) {
//            top = 61.0, left = 11.2
//            $('#fake-cursor').animate({top: `${top}%`, left: `${left}%`}, WELCOMEINTERVALTIME)
//          }
//        }, 0)
//        setTimeout(() => {
//          if (PLAYWELCOME) {
//            timestart = 0
//            visitedNodes = new Set([])
//            requestAnimationFrame(foo)
//          }
//        }, WELCOMEINTERVALTIME)
//      }
//      
//      var timestart, visitedNodes
//      function foo(timestamp) {
//        if (!timestart)
//          timestart = timestamp
//        const timeElapsed = timestamp - timestart
//        if (PLAYWELCOME && timeElapsed <= 16000 - WELCOMEINTERVALTIME) {
//          var left = nodeXScale(timeElapsed)
//          $('#fake-cursor').css({left: `${left}%`})
//          var pieceIndex = Math.round(nodePieceScaleIndex(timeElapsed))
//          var pieceName = nodesDataPieceNames2[pieceIndex]
//          var piece = nodesData[pieceName]
//          if (!visitedNodes.has(pieceName)) {
//            svg.classed(className, false);
//            label.classed('primary', false);
//            label.classed('secondary', false);
//            path.classed('primary', false).order();
//            hidePieceInformation()
//            
//            const name = piece.id
//            const d = nodesData[name]
//            svg.classed(className, true);
//            label.classed('primary', n => isPrimaryLabel(n, d));
//            label.classed('secondary', n => isSecondaryLabel(n, d));
//            path.classed('primary', n => isPrimaryPath(n, d)).filter('.primary').raise();
//            displayPieceInformation(name)
//            
//            visitedNodes.add(pieceName)
//          }
//          requestAnimationFrame(foo)
//        }
//        else if (PLAYWELCOME) {
//          var top = 50, left = 75
//          setTimeout(() => {
//            $('#fake-cursor').animate({top: `${top}%`, left: `${left}%`}, WELCOMEINTERVALTIME)
//          }, WELCOMEINTERVALTIME * 0.5)
//          setTimeout(() => {
//            svg.classed(className, false);
//            label.classed('primary', false);
//            label.classed('secondary', false);
//            path.classed('primary', false).order();
//            hidePieceInformation()
//          }, WELCOMEINTERVALTIME * 1.6)
//          setTimeout(() => {
//            if (PLAYWELCOME) {
//              goToSidePanel()
//            }
//          }, WELCOMEINTERVALTIME * 2)
//        }
//        else {
//          byeWelcome()
//        }
//      }
      
//      function goToArcs2() {
//        var top, left
//        setTimeout(() => {
//          if (PLAYWELCOME) {
//            top = 0.8, left = 2.31
//            $('#fake-cursor').animate({top: `${top}%`, left: `${left}%`}, 0)
//          }
//        }, 0)
//        setTimeout(() => {
//          if (PLAYWELCOME) {
//            timestart = 0
//            requestAnimationFrame(foo)
//          }
//        }, 0)
//      }
//      
//      var timestart
//      function foo(timestamp) {
//        if (!timestart)
//          timestart = timestamp
//        const timeElapsed = timestamp - timestart
//        if (PLAYWELCOME && timeElapsed <= initDemoTime) {
//          var left = nodeXScale(timeElapsed)
//          var top = nodeYScale(timeElapsed)
//          $('#fake-cursor').css({top: `${top}%`, left: `${left}%`})
//          requestAnimationFrame(foo)
//        }
//        else if (PLAYWELCOME) {
//          var top = 50, left = 50
//          setTimeout(() => {
//            $('#fake-cursor').animate({top: `${top}%`, left: `${left}%`}, WELCOMEINTERVALTIME * 0.5)
//            goToDescription()
//          }, WELCOMEINTERVALTIME * 0)
//        }
//        else {
//          byeWelcome()
//        }
//      }
      
      
//      function goToDescription() {
//        var top, left
//        setTimeout(() => {
//          if (PLAYWELCOME) {
//            top = 83.8, left = 37.5
//            //$('#fake-cursor').animate({top: `${top}%`, left: `${left}%`}, WELCOMEINTERVALTIME)
//          }
//        }, 0)
//        setTimeout(() => {
//          if (PLAYWELCOME) {
//            $('#date-range').addClass('highlighted')
//            setTimeout(() => {
//              $('#date-range').removeClass('highlighted')
//            }, WELCOMEINTERVALTIME * 1.2)
//            setTimeout(() => {
//              if (PLAYWELCOME) {
//                goToNodes()
//              }
//            }, WELCOMEINTERVALTIME * 1)
//          }
//        }, WELCOMEINTERVALTIME)
//      }
      
      function goToNodes() {
        var top, left
        setTimeout(() => {
          if (PLAYWELCOME) {
            top = 65, left = 33.7
            $('#fake-cursor').animate({top: `${top}%`, left: `${left}%`}, WELCOMEINTERVALTIME)
          }
          setTimeout(() => {
            if (PLAYWELCOME) {
              const name = 'Streams'
              const d = nodesData[name]
              svg.classed(className, true);
              label.classed('primary', n => isPrimaryLabel(n, d));
              label.classed('secondary', n => isSecondaryLabel(n, d));
              path.classed('primary', n => isPrimaryPath(n, d)).filter('.primary').raise();
              displayPieceInformation(name)
              
              setTimeout(() => {
                if (PLAYWELCOME) {
                  top = 67, left = 74.6
                  $('#fake-cursor').animate({top: `${top}%`, left: `${left}%`}, WELCOMEINTERVALTIME)
                  
                  setTimeout(() => {
                    svg.classed(className, false);
                    label.classed('primary', false);
                    label.classed('secondary', false);
                    path.classed('primary', false).filter('.primary').raise();
                    hidePieceInformation()
                  }, WELCOMEINTERVALTIME * 0.3)
                  
                  setTimeout(() => {
                    const name = 'The Stack-Up'
                    const d = nodesData[name]
                    svg.classed(className, true);
                    label.classed('primary', n => isPrimaryLabel(n, d));
                    label.classed('secondary', n => isSecondaryLabel(n, d));
                    path.classed('primary', n => isPrimaryPath(n, d)).filter('.primary').raise();
                    displayPieceInformation(name)
                    
                    setTimeout(() => {
                      if (PLAYWELCOME) {
                        
                        setTimeout(() => {
                          svg.classed(className, false);
                          label.classed('primary', false);
                          label.classed('secondary', false);
                          path.classed('primary', false).filter('.primary').raise();
                          hidePieceInformation()
                        }, WELCOMEINTERVALTIME * 0.3)
                        
                        goToNodes2()
                      }
                    }, WELCOMEINTERVALTIME * 1)
                  }, WELCOMEINTERVALTIME)
                }
              }, WELCOMEINTERVALTIME * 1)
            }
          }, WELCOMEINTERVALTIME)
        }, WELCOMEINTERVALTIME)
      }
      
      function goToNodes2() {
        var top, left
        setTimeout(() => {
          if (PLAYWELCOME) {
            top = 69, left = 50.8
            $('#fake-cursor').animate({top: `${top}%`, left: `${left}%`}, WELCOMEINTERVALTIME)
          }
          setTimeout(() => {
            if (PLAYWELCOME) {
              const name = 'Night Creature'
              const d = nodesData[name]
              svg.classed(className, true);
              label.classed('primary', n => isPrimaryLabel(n, d));
              label.classed('secondary', n => isSecondaryLabel(n, d));
              path.classed('primary', n => isPrimaryPath(n, d)).filter('.primary').raise();
              displayPieceInformation(name)
              
              setTimeout(() => {
                if (PLAYWELCOME) {
                  top = 65.5, left = 59.9
                  $('#fake-cursor').animate({top: `${top}%`, left: `${left}%`}, WELCOMEINTERVALTIME)
                  
                  setTimeout(() => {
                    svg.classed(className, false);
                    label.classed('primary', false);
                    label.classed('secondary', false);
                    path.classed('primary', false).filter('.primary').raise();
                    hidePieceInformation()
                  }, WELCOMEINTERVALTIME * 0.3)
                  
                  setTimeout(() => {
                    const name = 'Suite Otis'
                    const d = nodesData[name]
                    svg.classed(className, true);
                    label.classed('primary', n => isPrimaryLabel(n, d));
                    label.classed('secondary', n => isSecondaryLabel(n, d));
                    path.classed('primary', n => isPrimaryPath(n, d)).filter('.primary').raise();
                    displayPieceInformation(name)
                    
                    setTimeout(() => {
                      if (PLAYWELCOME) {
                        goToLegend()
                      }
                    }, WELCOMEINTERVALTIME * 1.8)
                  }, WELCOMEINTERVALTIME)
                }
              }, WELCOMEINTERVALTIME * 1)
            }
          }, WELCOMEINTERVALTIME)
        }, 0)
      }
      
      function goToLegend() {
        
        setTimeout(() => {
          svg.classed(className, false);
          label.classed('primary', false);
          label.classed('secondary', false);
          path.classed('primary', false).filter('.primary').raise();
          hidePieceInformation()
        }, WELCOMEINTERVALTIME * 0.3)
        
        var top, left
        setTimeout(() => {
          if (PLAYWELCOME) {
            top = 79.5, left = 11.5
            $('#fake-cursor').animate({top: `${top}%`, left: `${left}%`}, WELCOMEINTERVALTIME * 0.9)
          }
        }, 0)
        
        setTimeout(() => {
          if (PLAYWELCOME) {
            highlightByColor('AA')
            
            
            setTimeout(() => {
              setTimeout(() => {
                //unhighlightByColor()
              }, WELCOMEINTERVALTIME * 0.3)
              
              if (PLAYWELCOME) {
                top = 79.5, left = 15.4
                $('#fake-cursor').animate({top: `${top}%`, left: `${left}%`}, WELCOMEINTERVALTIME * 0.5)
            
                setTimeout(() => {
                  if (PLAYWELCOME) {
                    highlightByColor('nonAA')
                    
                    setTimeout(() => {
                      goToMiddle()
                    }, WELCOMEINTERVALTIME * 0.5)
                  }
                }, WELCOMEINTERVALTIME * 0.5)
              }
            }, WELCOMEINTERVALTIME * 0.8)
          }
          
          
        }, WELCOMEINTERVALTIME * 0.9)
      }
      
      function goToMiddle() { // NOT MIDDLE ANYMORE
        var top, left
        setTimeout(() => {
          if (PLAYWELCOME) {
            // top = 50, left = 50 // NOT MIDDLE ANYMORE
            // $('#fake-cursor').animate({top: `${top}%`, left: `${left}%`}, WELCOMEINTERVALTIME * 3.5)
            top = 75, left = 15.4
            $('#fake-cursor').animate({top: `${top}%`, left: `${left}%`}, WELCOMEINTERVALTIME * 0.8)
          }
          setTimeout(() => {
            unhighlightByColor()
          }, WELCOMEINTERVALTIME * 0.3)
        }, WELCOMEINTERVALTIME * 0.5)
        
        setTimeout(() => {
          svg.classed(className, false);
          label.classed('primary', false);
          label.classed('secondary', false);
          path.classed('primary', false).filter('.primary').raise();
          hidePieceInformation()
        }, WELCOMEINTERVALTIME * 2)
        
        setTimeout(() => {
          if (PLAYWELCOME) {
            goToSidePanel()
          }
        }, WELCOMEINTERVALTIME * 4.5)
      }
      
      function goToSidePanel() {
        var top, left
        setTimeout(() => {
          if (PLAYWELCOME) {
            top = 12.1, left = 11
            $('#fake-cursor').animate({top: `${top}%`, left: `${left}%`}, WELCOMEINTERVALTIME * 0.8)
            setTimeout(() => {
              if (PLAYWELCOME) {
                document.getElementById('menu-icon').dispatchEvent(new Event('mousedown'))
                setTimeout(() => {
                  if (PLAYWELCOME) {
                    goToSort2()
                  }
                }, WELCOMEINTERVALTIME * 0.5)
              }
            }, WELCOMEINTERVALTIME * 0.8)
          }
        }, 0)
      }
      
//      function goToSort() {
//        var top, left
//        const mainContent = document.getElementById('main-content')
//        const mainContentRect = mainContent.getBoundingClientRect()
//        setTimeout(() => {
//          if (PLAYWELCOME) {
//            const sortBy = document.getElementById('dropdownmenu-sort')
//            const sortByRect = sortBy.getBoundingClientRect()
//            top = sortByRect.top + sortByRect.height * 0.5 - mainContentRect.top
//            left = sortByRect.left + sortByRect.width * 0.18 - mainContentRect.left
//            $('#fake-cursor').animate({top: `${top}px`, left: `${left}px`}, WELCOMEINTERVALTIME)
//          }
//        }, 0)
//        setTimeout(() => {
//          if (PLAYWELCOME) {
//            $('#dropdownmenu-sort .dropdown-content').css('display', 'block')
//          }
//        }, WELCOMEINTERVALTIME)
//        setTimeout(() => {
//          if (PLAYWELCOME) {
//            const degreeOpt = $('#dropdownmenu-sort .dropdown-content span:nth-child(3)')[0]
//            const degreeRect = degreeOpt.getBoundingClientRect()
//            top = degreeRect.top + degreeRect.height * 0.5 - mainContentRect.top
//            left = degreeRect.left + degreeRect.width * 0.2 - mainContentRect.left
//            $('#fake-cursor').animate({top: `${top}px`, left: `${left}px`}, WELCOMEINTERVALTIME)
////            setTimeout(() => {
////              $('#dropdownmenu-sort .dropdown-content span:nth-child(1)').css('color', 'black')
////            }, WELCOMEINTERVALTIME * 1/6)
////            setTimeout(() => {
////              $('#dropdownmenu-sort .dropdown-content span:nth-child(1)').css('color', '#808080')
////              $('#dropdownmenu-sort .dropdown-content span:nth-child(2)').css('color', 'black')
////            }, WELCOMEINTERVALTIME * 3/6)
//            setTimeout(() => {
//              if (PLAYWELCOME) {
////                $('#dropdownmenu-sort .dropdown-content span:nth-child(2)').css('color', '#808080')
//                $('#dropdownmenu-sort .dropdown-content span:nth-child(3)').css('color', 'black')
//                
//                setTimeout(() => {
//                  $('#dropdownmenu-sort .dropdown-content span:nth-child(3)').css('color', '#808080')
//                  $('#dropdownmenu-sort .dropdown-content').css('display', 'none')
//                  $('#dropdownmenu-sort .dropdown-content').css('display', '')
//                
//                  selectedNodeSortingFunctionName = 'degree'
//                  selectedNodeSortingFunctionIndex = nodeSortingFunctionNames.indexOf(selectedNodeSortingFunctionName)
//                  selectedNodeSortingFunction = nodeSortingFunctions[selectedNodeSortingFunctionIndex].f
//                  updateOrder(svg, label, path, overlay, selectedNodeSortingFunction)
//                  
//                  setTimeout(() => {
//                    if (PLAYWELCOME) {
//                      goToVideo()
//                    }
//                  }, WELCOMEINTERVALTIME * 3)
//                }, WELCOMEINTERVALTIME * 0.3)
//              }
//            }, WELCOMEINTERVALTIME * 6/6)
//          }
//        }, WELCOMEINTERVALTIME * 1.2)
//      }
      
      function goToSort2() {
        var top, left
        const mainContent = document.getElementById('main-content')
        const mainContentRect = mainContent.getBoundingClientRect()
        setTimeout(() => {
          if (PLAYWELCOME) {
            const sortBy = document.getElementById('dropdownmenu-sort')
            const sortByRect = sortBy.getBoundingClientRect()
            top = sortByRect.top + sortByRect.height * 0.5 - mainContentRect.top
            left = sortByRect.left + sortByRect.width * 0.18 - mainContentRect.left
            $('#fake-cursor').animate({top: `${top}px`, left: `${left}px`}, WELCOMEINTERVALTIME * 0.5)
          }
        }, 0)
        setTimeout(() => {
          if (PLAYWELCOME) {
            $('#dropdownmenu-sort .dropdown-content').css('display', 'block')
            const degreeOpt = $('#dropdownmenu-sort .dropdown-content span:nth-child(1)')[0]
            const degreeRect = degreeOpt.getBoundingClientRect()
            top = degreeRect.top + degreeRect.height * 0.5 - mainContentRect.top
            left = degreeRect.left + degreeRect.width * 0.2 - mainContentRect.left
            $('#fake-cursor').animate({top: `${top}px`, left: `${left}px`}, WELCOMEINTERVALTIME * 1)
          }
        }, WELCOMEINTERVALTIME * 0.5)
        setTimeout(() => {
          if (PLAYWELCOME) {
            const degreeOpt = $('#dropdownmenu-sort .dropdown-content span:nth-child(2)')[0]
            const degreeRect = degreeOpt.getBoundingClientRect()
            top = degreeRect.top + degreeRect.height * 0.5 - mainContentRect.top
            left = degreeRect.left + degreeRect.width * 0.2 - mainContentRect.left
            $('#fake-cursor').animate({top: `${top}px`, left: `${left}px`}, WELCOMEINTERVALTIME)
//            setTimeout(() => {
//              $('#dropdownmenu-sort .dropdown-content span:nth-child(1)').css('color', 'black')
//            }, WELCOMEINTERVALTIME * 1/6)
//            setTimeout(() => {
//              $('#dropdownmenu-sort .dropdown-content span:nth-child(1)').css('color', '#808080')
//              $('#dropdownmenu-sort .dropdown-content span:nth-child(2)').css('color', 'black')
//            }, WELCOMEINTERVALTIME * 3/6)
            setTimeout(() => {
              if (PLAYWELCOME) {
//                $('#dropdownmenu-sort .dropdown-content span:nth-child(1)').css('color', '#808080')
//                $('#dropdownmenu-sort .dropdown-content span:nth-child(2)').css('color', 'black')
                $('#dropdownmenu-sort .dropdown-content span:nth-child(1)').removeClass('selected')
                $('#dropdownmenu-sort .dropdown-content span:nth-child(2)').addClass('fake-hover')
                
                setTimeout(() => {
                  //$('#dropdownmenu-sort .dropdown-content span:nth-child(2)').css('color', '#808080')
                  //$('#dropdownmenu-sort .dropdown-content').css('display', 'none')
                  //$('#dropdownmenu-sort .dropdown-content').css('display', '')
                
                  selectedNodeSortingFunctionName = 'total number of performances'
                  selectedNodeSortingFunctionIndex = nodeSortingFunctionNames.indexOf(selectedNodeSortingFunctionName)
                  selectedNodeSortingFunction = nodeSortingFunctions[selectedNodeSortingFunctionIndex].f
                  updateOrder(svg, label, path, overlay, selectedNodeSortingFunction)
                  
                  setTimeout(() => {
                    if (PLAYWELCOME) {
                      goToSort3()
                    }
                  }, 0)
                }, WELCOMEINTERVALTIME * 0.3)
              }
            }, WELCOMEINTERVALTIME * 0.5)
          }
        }, WELCOMEINTERVALTIME * 1.5)
      }
      
      function goToSort3() {
        var top, left
        const mainContent = document.getElementById('main-content')
        const mainContentRect = mainContent.getBoundingClientRect()
//        setTimeout(() => {
//          if (PLAYWELCOME) {
//            const sortBy = document.getElementById('dropdownmenu-sort')
//            const sortByRect = sortBy.getBoundingClientRect()
//            top = sortByRect.top + sortByRect.height * 0.5 - mainContentRect.top
//            left = sortByRect.left + sortByRect.width * 0.18 - mainContentRect.left
//            $('#fake-cursor').animate({top: `${top}px`, left: `${left}px`}, WELCOMEINTERVALTIME)
//          }
//        }, 0)
//        setTimeout(() => {
//          if (PLAYWELCOME) {
//            $('#dropdownmenu-sort .dropdown-content').css('display', 'block')
//          }
//        }, WELCOMEINTERVALTIME)
        setTimeout(() => {
          if (PLAYWELCOME) {
            const degreeOpt = $('#dropdownmenu-sort .dropdown-content span:nth-child(3)')[0]
            const degreeRect = degreeOpt.getBoundingClientRect()
            top = degreeRect.top + degreeRect.height * 0.5 - mainContentRect.top
            left = degreeRect.left + degreeRect.width * 0.2 - mainContentRect.left
            $('#fake-cursor').animate({top: `${top}px`, left: `${left}px`}, WELCOMEINTERVALTIME * 0.5)
//            setTimeout(() => {
//              $('#dropdownmenu-sort .dropdown-content span:nth-child(1)').css('color', 'black')
//            }, WELCOMEINTERVALTIME * 1/6)
//            setTimeout(() => {
//              $('#dropdownmenu-sort .dropdown-content span:nth-child(1)').css('color', '#808080')
//              $('#dropdownmenu-sort .dropdown-content span:nth-child(2)').css('color', 'black')
//            }, WELCOMEINTERVALTIME * 3/6)
            setTimeout(() => {
              if (PLAYWELCOME) {
                $('#dropdownmenu-sort .dropdown-content span:nth-child(2)').removeClass('fake-hover')
                $('#dropdownmenu-sort .dropdown-content span:nth-child(3)').addClass('fake-hover')
                
                setTimeout(() => {
//                  $('#dropdownmenu-sort .dropdown-content span:nth-child(3)').css('color', '#808080')
//                  $('#dropdownmenu-sort .dropdown-content').css('display', 'none')
//                  $('#dropdownmenu-sort .dropdown-content').css('display', '')
                
                  selectedNodeSortingFunctionName = 'degree'
                  selectedNodeSortingFunctionIndex = nodeSortingFunctionNames.indexOf(selectedNodeSortingFunctionName)
                  selectedNodeSortingFunction = nodeSortingFunctions[selectedNodeSortingFunctionIndex].f
                  updateOrder(svg, label, path, overlay, selectedNodeSortingFunction)
                  
                  setTimeout(() => {
                    if (PLAYWELCOME) {
                      goToRevelations()
                    }
                  }, WELCOMEINTERVALTIME * 3)
                }, WELCOMEINTERVALTIME * 0)
              }
            }, WELCOMEINTERVALTIME * 0.5)
          }
        }, WELCOMEINTERVALTIME * 1)
      }
      
      function goToRevelations() {
        var top, left
        setTimeout(() => {
          if (PLAYWELCOME) {
            $('#dropdownmenu-sort .dropdown-content span:nth-child(3)').removeClass('fake-hover')
            $('#dropdownmenu-sort .dropdown-content').css('display', 'none')
            $('#dropdownmenu-sort .dropdown-content').css('display', '')

            top = 52, left = 25.3
            $('#fake-cursor').animate({top: `${top}%`, left: `${left}%`}, WELCOMEINTERVALTIME * 0.5)
          }
          setTimeout(() => {
            if (PLAYWELCOME) {
              const name = 'Revelations'
              const d = nodesData[name]
              svg.classed(className, true);
              label.classed('primary', n => isPrimaryLabel(n, d));
              label.classed('secondary', n => isSecondaryLabel(n, d));
              path.classed('primary', n => isPrimaryPath(n, d)).filter('.primary').raise();
              displayPieceInformation(name)
              
              setTimeout(() => {
                if (PLAYWELCOME) {
                  goToSearch()
                }
              }, WELCOMEINTERVALTIME * 0)
            }
          }, WELCOMEINTERVALTIME * 0.5)
        }, 3)
      }
      
      function goToSearch() {
        var top, left
        const mainContent = document.getElementById('main-content')
        const mainContentRect = mainContent.getBoundingClientRect()
        
        const offset = 0.5
        
        setTimeout(() => {
          if (PLAYWELCOME) {
            const searchBar = document.getElementById('searchInput')
            const searchBarRect = searchBar.getBoundingClientRect()
            top = searchBarRect.top + searchBarRect.height * 0.7 - mainContentRect.top
            left = searchBarRect.left + searchBarRect.width * 0.2 - mainContentRect.left
            $('#fake-cursor').animate({top: `${top}px`, left: `${left}px`}, WELCOMEINTERVALTIME * 0.5)
            
            setTimeout(() => {
              svg.classed(className, false);
              label.classed('primary', false);
              label.classed('secondary', false);
              path.classed('primary', false).filter('.primary').raise();
              hidePieceInformation()
            }, WELCOMEINTERVALTIME * 0.1)
          }
        }, WELCOMEINTERVALTIME * offset)
        
        $('div.searchResults').show()
//        setTimeout(() => {
//          $('#searchCloseButton').addClass('active')
//          $('#searchInput').addClass('active') }, WELCOMEINTERVALTIME * 1.7)
        setTimeout(() => {
          $('#searchInput').val('C'); $('li.liPerformer').hide(); $('li.liPerformer:contains(C)').show() }, WELCOMEINTERVALTIME * (offset + 0.8))
        setTimeout(() => {
          $('#searchInput').val('Cr'); $('li.liPerformer').hide(); $('li.liPerformer:contains(Cr)').show() }, WELCOMEINTERVALTIME * (offset + 0.9))
        setTimeout(() => {
          $('#searchInput').val('Cry'); $('li.liPerformer').hide(); $('li.liPerformer:contains(Cry)').show() }, WELCOMEINTERVALTIME * (offset + 1))
        
        setTimeout(() => {
          if (PLAYWELCOME) {
            const firstResult = $('li.liPerformer').filter((i, d) => $(d).css('display') == 'block')[0]
            const firstResultRect = firstResult.getBoundingClientRect()
            top = firstResultRect.top + firstResultRect.height * 0.5 - mainContentRect.top
            left = firstResultRect.left + firstResultRect.width * 0.12 - mainContentRect.left
//            const searchBar = document.getElementById('searchInput')
//            const searchBarRect = searchBar.getBoundingClientRect()
//            left = searchBarRect.left + searchBarRect.width * 0.2 - mainContentRect.left
            $('#fake-cursor').animate({top: `${top}px`, left: `${left}px`}, WELCOMEINTERVALTIME * 0.4)
          }
        }, WELCOMEINTERVALTIME * (offset + 1.5))
        
        setTimeout(() => {
          if (PLAYWELCOME) {
            const name = 'Cry'
            const d = nodesData[name]
            var r = applyMultiSelectionActions(null, d)
            svg.classed(className, globalVar.anyMultiSelected);
            label.classed('primary', n => isSelectedPrimaryLabel(n, d));
            label.classed('secondary', n => isSelectedSecondaryLabel(n, d));
            path.classed('primary', n => isSelectedPrimaryPath(n, d)).filter('.primary').raise();
            
//            if (!r) {
//              svg.classed(className, false);
//              label.classed('primary', false);
//              label.classed('secondary', false);
//              path.classed('primary', false).order();
//            }
            
//            if (!globalVar.multiSelectedList.includes(li.id))
//              li.classList.add('noevents')

            displayPieceInformation(name)
          }
          setTimeout(() => {
            if (PLAYWELCOME) {
              goToVideo()
            }
          }, WELCOMEINTERVALTIME)
        }, WELCOMEINTERVALTIME * (offset + 1.7))
      }
      
//      function goToSort() {
//        var top, left
//        const mainContent = document.getElementById('main-content')
//        const mainContentRect = mainContent.getBoundingClientRect()
//        setTimeout(() => {
//          if (PLAYWELCOME) {
//            const sortBy = document.getElementById('dropdownmenu-sort')
//            const sortByRect = sortBy.getBoundingClientRect()
//            top = sortByRect.top + sortByRect.height * 0.5 - mainContentRect.top
//            left = sortByRect.left + sortByRect.width * 0.18 - mainContentRect.left
//            $('#fake-cursor').animate({top: `${top}px`, left: `${left}px`}, WELCOMEINTERVALTIME)
//          }
//        }, 0)
//        setTimeout(() => {
//          if (PLAYWELCOME) {
//            $('#dropdownmenu-sort .dropdown-content').css('display', 'block')
//          }
//        }, WELCOMEINTERVALTIME)
//        setTimeout(() => {
//          if (PLAYWELCOME) {
//            const degreeOpt = $('#dropdownmenu-sort .dropdown-content span:nth-child(3)')[0]
//            const degreeRect = degreeOpt.getBoundingClientRect()
//            top = degreeRect.top + degreeRect.height * 0.5 - mainContentRect.top
//            left = degreeRect.left + degreeRect.width * 0.2 - mainContentRect.left
//            $('#fake-cursor').animate({top: `${top}px`, left: `${left}px`}, WELCOMEINTERVALTIME)
////            setTimeout(() => {
////              $('#dropdownmenu-sort .dropdown-content span:nth-child(1)').css('color', 'black')
////            }, WELCOMEINTERVALTIME * 1/6)
////            setTimeout(() => {
////              $('#dropdownmenu-sort .dropdown-content span:nth-child(1)').css('color', '#808080')
////              $('#dropdownmenu-sort .dropdown-content span:nth-child(2)').css('color', 'black')
////            }, WELCOMEINTERVALTIME * 3/6)
//            setTimeout(() => {
//              if (PLAYWELCOME) {
////                $('#dropdownmenu-sort .dropdown-content span:nth-child(2)').css('color', '#808080')
//                $('#dropdownmenu-sort .dropdown-content span:nth-child(3)').css('color', 'black')
//                
//                setTimeout(() => {
//                  $('#dropdownmenu-sort .dropdown-content span:nth-child(3)').css('color', '#808080')
//                  $('#dropdownmenu-sort .dropdown-content').css('display', 'none')
//                  $('#dropdownmenu-sort .dropdown-content').css('display', '')
//                
//                  selectedNodeSortingFunctionName = 'degree'
//                  selectedNodeSortingFunctionIndex = nodeSortingFunctionNames.indexOf(selectedNodeSortingFunctionName)
//                  selectedNodeSortingFunction = nodeSortingFunctions[selectedNodeSortingFunctionIndex].f
//                  updateOrder(svg, label, path, overlay, selectedNodeSortingFunction)
//                  
//                  setTimeout(() => {
//                    if (PLAYWELCOME) {
//                      goToVideo()
//                    }
//                  }, WELCOMEINTERVALTIME * 3)
//                }, WELCOMEINTERVALTIME * 0.3)
//              }
//            }, WELCOMEINTERVALTIME * 6/6)
//          }
//        }, WELCOMEINTERVALTIME * 1.2)
//      }
      
      function goToVideo() {
        var top, left
        top = 25, left = 12
        $('#fake-cursor').animate({top: `${top}%`, left: `${left}%`}, WELCOMEINTERVALTIME)
        
        setTimeout(() => {
          svg.classed(className, false);
          label.classed('primary', false);
          label.classed('secondary', false);
          path.classed('primary', false).order();
          
          hidePieceInformation()
          
          closeSearch2()
        }, WELCOMEINTERVALTIME * 0.1)
        
        setTimeout(() => {
          if (PLAYWELCOME) {
            const tooltip = document.getElementById('custom-tooltip')
            const link = document.getElementById('video-link');
            tooltip.textContent = link.getAttribute('title'); // Use the title text
            tooltip.style.left = (left - 6) + '%'
            tooltip.style.top =  (top - 4) + '%'
//            tooltip.style.display = 'block'
            tooltip.style.visibility = 'visible'
            
            // This should be in byeWelcome but I save time this way
            $('#dropdownmenu-sort .dropdown-content span:nth-child(1)').addClass('selected')
            $('#dropdownmenu-sort .dropdown-content span').removeClass('fake-hover')
          
            selectedNodeSortingFunctionName = 'first documented performance'
            selectedNodeSortingFunctionIndex = nodeSortingFunctionNames.indexOf(selectedNodeSortingFunctionName)
            selectedNodeSortingFunction = nodeSortingFunctions[selectedNodeSortingFunctionIndex].f
            updateOrder(svg, label, path, overlay, selectedNodeSortingFunction)
            setTimeout(() => {
              if (PLAYWELCOME) {
                byeWelcome(false)
              }
            }, WELCOMEINTERVALTIME * 2)
          }
        }, WELCOMEINTERVALTIME)
      }
      
      function hideCustomTooltip() {
        const tooltip = document.getElementById('custom-tooltip')
        tooltip.textContent = '.'
        tooltip.style.visibility = 'hidden'
      }
      
      const nodesDataPieceNames = Object.values(graph.nodes).map(item => item.id)
      const freqs = nodesDataPieceNames.map(name => Math.round(nodesData[name].absSize))
      const nodesDataPieceNames2 = replicate(nodesDataPieceNames, freqs)
      const nodePieceScaleIndex = d3.scaleLinear().domain([0, 14000]).range([0, nodesDataPieceNames2.length-1])
//      const nodeXScale = d3.scaleLinear().domain([0, 14000]).range([11.2, 89.0])
      const initDemoTime = 12000
      const nodeXScale = d3.scaleLinear().domain([0, initDemoTime]).range([2.31, 50.0])
      const nodeYScale = d3.scaleLinear().domain([0, initDemoTime]).range([0.8, 50.0])
      
      
      
      
      
      
      
      
      return overlay
    }
    
    const mainContent = document.getElementById('main-content');
    const layoutObserver = new ResizeObserver(() => {
      processWindowSize();
    });
    layoutObserver.observe(mainContent);
    
    window.addEventListener('resize', processWindowSize)
    function processWindowSize() {
      const mainContentElem = document.getElementById('main-content')
      const mainContentRect = mainContentElem.getBoundingClientRect()
      const mcw = mainContentRect.width
      const mch = mainContentRect.height
      const scaleX = mcw / WIDTH0
      const scaleY = mch / HEIGHT0
      $('#myviz').css('scale', `${scaleX} ${scaleY}`)
      
      $('.resizable-text').removeClass('smooth')
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        $('.resizable-text').addClass('smooth')
      }, 100)
    }
    
    function drawViz() {
      drawSvg()
      const label = drawNodesAndLabels()
      const path = drawPaths()
      const overlay = addInteractivity(label, path)
      cropToContent()
      processWindowSize()
    }
    
    function cropToContent() {
      setTimeout(() => {
        var mysvg = $('#mysvg')[0]
        var rect0 = mysvg.getBoundingClientRect()
        var top0 = rect0.top
        
        var lines = $('#lines')[0]
        var rect1 = lines.getBoundingClientRect()
        var top1 = rect1.top
        var h1 = rect1.height * 1.03 // bold
        
        var labels = $('#labels')[0]
        var rect2 = labels.getBoundingClientRect()
        var h2 = rect2.height
        var w2 = rect2.width
        
        var topDiff = top0 - top1
        var theoreticalHeight = h1 + h2
        var h = theoreticalHeight - topDiff
        
        T = topDiff
        //T = HEIGHT0 - h
        L = 0
        W = w2
        H = h
        
        S = Math.min(1/3 * W/theoreticalHeight, HEIGHT0 / WIDTH0)
        
        $('#mysvg').css({
          'position': 'absolute',
          'top': T * 0.95,
          'left': L + M,
        })
        $('#mysvg').width(W)
        $('#mysvg').height(H)
        
      }, 10)
    }
    
    var T, L, W, H // top, left, width, height
    //const S = window.innerHeight / window.innerWidth // scale
    var S // scale
    
    function rotate0() {
      $('#mysvg').css({
        'transform': `scale(${paramScale})`,
        'top': T + M,
        'left': L + M,
      })
      $('#labels').attr('text-anchor', 'end')
      const texts = $('#labels g text')
      texts.attr('x', -texts.attr('x'))
      texts.css('transform', 'scale(1, 1)')
      
      $('#myviz').css({
        //'top': 0,
        //'left': 0,
      })
      
      $('#piece-info').css({
        //'top': 0,
        //'left': window.innerWidth*1/3,
      })
      $('#piece-info').removeClass('visible')
    }
    
    function rotate1() {
      $('#mysvg').css({
        'transition': 'all 2s',
        'transform': `scale(${paramScale*S}) rotate(90deg)`,
        'top': ($('#myviz').height() - W*S) / 2,
        'left': ($('#myviz').width() + H*S - T*S) / 2,
      })
      
      $('#myviz').css({
        'top': 0,
        'left': 0,
      })
      
      $('#piece-info').css({
        //'top': 0,
        'left': window.innerWidth*1/3,
      })
      $('#piece-info').addClass('visible')
    }
    
    function rotate2() {
      $('#mysvg').css({
      })
      
      $('#myviz').css({
        //'top': 0,
        'left': window.innerWidth*2/3,
      })
      //
      
      $('#piece-info').css({
        //'top': 0,
        'left': 0,
      })
    }
    
    function rotate3() {
      $('#mysvg').css({
        'transform': `scale(-${paramScale*S}, ${paramScale*S}) rotate(90deg)`,
        'left': window.innerWidth*1/3 - ($('#myviz').width() + H*S - T*S) / 2,
      })
      $('#labels').attr('text-anchor', 'start')
      const texts = $('#labels g text')
      texts.attr('x', -texts.attr('x'))
      texts.css('transform', 'scale(-1, 1)')
      
      $('#myviz').css({
        //'top': 0,
        //'left': window.innerWidth*2/3,
      })
      
      $('#piece-info').css({
        //'top': 0,
        //'left': 0 ,
      })
    }
    
    function rotate4() {
      $('#mysvg').css({
      })
      
      $('#myviz').css({
        //'top': 0,
        'left': 0,
      })
      
      $('#piece-info').css({
        //'top': 0,
        'left': window.innerWidth*1/3,
      })
    }
    
    
    ////////////////////////////////////////////////////////////////////////////////
    //
    // Piece information and images
    //
    ////////////////////////////////////////////////////////////////////////////////
    
    function displayTitle(piece) {
      $('#box1').text(piece)
    }
    
    function displayImage(piece) {
      $('.piece-img').removeClass('visible')
      const pieceElem = $(`.piece-img[id="${piece}"]`)
      const src = pieceElem.attr('src')
      const slashIndex = src.indexOf('/')
      if (!src.slice(slashIndex+1).toLowerCase().startsWith('zz'))
        pieceElem.addClass('visible')
    }
    
    function formatList(lst) {
      var r = ''
      if (lst.length == 0)
        r += ''
      else if (lst.length == 1)
        r += lst[0]
      else if (lst.length == 2)
        r += lst[0] + ' and ' + lst[1]
      else {
        for (var i=0; i<lst.length-1; i++) {
          r += lst[i] + ', '
        }
        r += 'and ' + lst[i]
      }
      return r
    }
    
    function formatYears(lst) {
      var r
      if (lst.length == 0)
        r = ''
      else if (lst.length == 1)
        r = 'in ' + lst[0]
      else
        r = 'between ' + lst[0] + ' and ' + lst[lst.length-1]
      return r
    }
    
    function displayData(piece) {
      const info = pieceData[piece]
      const content = `Choreographed by ${formatList(info.choreographers)}
        First documented performance on ${info.first_date}
        For a total count of ${info.n_performances} performances ${formatYears(info.years)}`
      $('#box2').text(content)
    }
    
    function displayPieceInformation(piece) {
      displayTitle(piece)
      displayData(piece)
      displayImage(piece)
    }
    
    function hidePieceInformation() {
      $('#box1').text('')
      $('.piece-img').removeClass('visible')
      $('#box2').text('')
    }
    
    
  })
})

$(() => {
//  $('.draggable').draggable()
})


document.getElementById('menu-icon').addEventListener('mousedown', function(ev) {
  $('.leftable').toggleClass('left');
  $('#side-panel').toggleClass('visible');
})


$('#yt-video').on('mouseover', ev => { ev.preventDefault(); })
$('#video-link').on('mouseover', ev => { ev.preventDefault(); })

//$('#play-pause-container.intro').on('mousedown', ev => {
//  $('#play-pause-container.intro').removeClass('intro')
//  $('#intro').hide()
//})
//$('#intro').on('mousedown', ev => {
//  $('#play-pause-container.intro').removeClass('intro')
//  $('#intro').hide()
//})


function removeIntro(ev) {
  $('#play-pause-container.intro').removeClass('intro')
  $('#interface.intro').removeClass('intro')
  $('#intro').hide()
}

$('#play-pause-container.intro').on('mousedown', removeIntro)
$('#intro').on('mousedown', removeIntro)
setTimeout(() => { removeIntro() }, 4000)


// Interactivity

function multiSelectionAux() {
  globalVar.multiSelectedList = Object.values(globalVar.multiSelectedDict)
//  globalVar.anyMultiSelected = globalVar.multiSelectedList.some(x => x == true)
//  globalVar.allMultiSelected = globalVar.multiSelectedList.every(x => x == true)
  globalVar.countMultiSelected = globalVar.multiSelectedList.filter(x => x == true).length
  globalVar.anyMultiSelected = globalVar.countMultiSelected > 0
  globalVar.allMultiSelected = globalVar.countMultiSelected == globalVar.multiSelectedList.length
  
  $('li.liPerformer').removeClass('fake-hover')
  $('li.liPerformer').removeClass('selected')
  for (var k in globalVar.multiSelectedDict) {
    if (globalVar.multiSelectedDict[k])
      $(`li[id="${k}"]`).addClass('selected')
  }
}

function applyMultiSelectionActions(ev, d) {
  if (ev && (ev.ctrlKey || ev.shiftKey || ev.AltKey || ev.metaKey)) {
    globalVar.multiSelectedDict[d.id] = !globalVar.multiSelectedDict[d.id]
    if (globalVar.multiSelectedDict[d.id])
      globalVar.multiSelectionList.push(d.id)
    else
      removeItem(globalVar.multiSelectionList, d.id)
  }
  else {
    var prev
    if (globalVar.countMultiSelected > 1) { // if there were two or more nodes selected and now simple selecting a previously multiselected node, reset the other selected nodes but not this one
      prev = false
    }
    else {
      prev = globalVar.multiSelectedDict[d.id]
    }
    for (var k in globalVar.multiSelectedDict) {globalVar.multiSelectedDict[k] = false}
    globalVar.multiSelectedDict[d.id] = !prev
    if (globalVar.multiSelectedDict[d.id])
      globalVar.multiSelectionList = [d.id]
    else
      globalVar.multiSelectionList = []
  }
  multiSelectionAux()
  return globalVar.multiSelectedDict[d.id]
}

function resetMultiSelection() {
  for (var k in globalVar.multiSelectedDict) {globalVar.multiSelectedDict[k] = false}
  globalVar.multiSelectionList = []
  multiSelectionAux()
}

function isPrimaryLabel(n, d) {
  return n === d
}

function isSecondaryLabel(n, d) {
  return n.sourceLinks.some(l => l.target === d) || n.targetLinks.some(l => l.source === d)
}

function isPrimaryPath(n, d) {
  return n.source === d || n.target === d
}

function isPrimaryPath2(l, d) {
  return l.target === d
}

function isMultiSelected(n) {
  return globalVar.multiSelectionList.includes(n)
}

function isSelectedPrimaryLabel(n, d) {
  return globalVar.multiSelectedDict[n.id]
}

function isSelectedSecondaryLabel(n, d) {
  return n.sourceLinks.some(l => globalVar.multiSelectedDict[l.target.id]) || n.targetLinks.some(l => globalVar.multiSelectedDict[l.source.id])
}

function isSelectedPrimaryPath(n, d) {
  return globalVar.multiSelectedDict[n.source.id] || globalVar.multiSelectedDict[n.target.id]
}

function toDomId(str) {
  // Convert to lowercase
  let id = str.toLowerCase()
    // Replace accented characters with their ASCII equivalents
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    // Replace spaces and invalid characters with dashes
    .replace(/[^a-z0-9-_:.]/g, '-')
    // Collapse multiple dashes into one
    .replace(/-+/g, '-')
    // Trim leading/trailing dashes
    .replace(/^-+|-+$/g, '');
  
  // If the ID starts with a digit, prefix it
  if (/^[0-9]/.test(id)) {
    id = 'id-' + id;
  }
  
  return id;
}

function removeItem(array, itemToRemove) {
  const index = array.indexOf(itemToRemove)
  if (index !== -1)
    array.splice(index, 1)
}

function replicate(a, freqs) {
  return a.flatMap((x, i) => Array(freqs[i]).fill(x))
}




////////////////////////////////////////////////////////////////////////////////

// Color palette

var palettes = [
  {id: d3.interpolateBlues, name: 'Blues'},
  {id: d3.interpolateBrBG, name: 'BrBG'},
  {id: d3.interpolateBuGn, name: 'BuGn'},
  {id: d3.interpolateBuPu, name: 'BuPu'},
  {id: d3.interpolateCividis, name: 'Cividis'},
  {id: d3.interpolateCool, name: 'Cool'},
  {id: d3.interpolateCubehelixDefault, name: 'CubehelixDefault'},
  {id: d3.interpolateGnBu, name: 'GnBu'},
  {id: d3.interpolateGreens, name: 'Greens'},
  {id: d3.interpolateGreys, name: 'Greys'},
  {id: d3.interpolateInferno, name: 'Inferno'},
  {id: d3.interpolateMagma, name: 'Magma'},
  {id: d3.interpolateOranges, name: 'Oranges'},
  {id: d3.interpolateOrRd, name: 'OrRd'},
  {id: d3.interpolatePiYG, name: 'PiYG'},
  {id: d3.interpolatePlasma, name: 'Plasma'},
  {id: d3.interpolatePRGn, name: 'PRGn'},
  {id: d3.interpolatePuBu, name: 'PuBu'},
  {id: d3.interpolatePuBuGn, name: 'PuBuGn'},
  {id: d3.interpolatePuOr, name: 'PuOr'},
  {id: d3.interpolatePuRd, name: 'PuRd'},
  {id: d3.interpolatePurples, name: 'Purples'},
  {id: d3.interpolateRainbow, name: 'Rainbow'},
  {id: d3.interpolateRdBu, name: 'RdBu'},
  {id: d3.interpolateRdGy, name: 'RdGy'},
  {id: d3.interpolateRdPu, name: 'RdPu'},
  {id: d3.interpolateRdYlBu, name: 'RdYlBu'},
  {id: d3.interpolateRdYlGn, name: 'RdYlGn'},
  {id: d3.interpolateReds, name: 'Reds'},
  {id: d3.interpolateSinebow, name: 'Sinebow'},
  {id: d3.interpolateSpectral, name: 'Spectral'},
  {id: d3.interpolateTurbo, name: 'Turbo'},
  {id: d3.interpolateViridis, name: 'Viridis'},
  {id: d3.interpolateWarm, name: 'Warm'},
  {id: d3.interpolateYlGn, name: 'YlGn'},
  {id: d3.interpolateYlGnBu, name: 'YlGnBu'},
  {id: d3.interpolateYlOrBr, name: 'YlOrBr'},
  {id: d3.interpolateYlOrRd, name: 'YlOrRd'},
  
  {id: (x => x == 0 ? paramNonAA : paramAA), name: 'choreographer'},
]
var paletteNames = palettes.map(x => x.name)
var paletteI = paletteNames.indexOf(paletteName)
var palette = palettes[paletteI].id

// Node coloring

var nodeColoringFunctions = [
  {f: fConstant, name: '-- all same color --'},
  {f: fFirstDocumentedPerformance, name: 'first documented performance'},
  {f: fDegree, name: 'degree'},
  {f: fWeightedDegree, name: 'weighted degree'},
  {f: fNumberYearsPerformed, name: 'number of years performed'},
  {f: fTotalNumberPerformances, name: 'total number of performances'},
  {f: fChoreographer, name: 'choreographer'},
]
var nodeColoringFunctionNames = nodeColoringFunctions.map(x => x.name)
var selectedNodeColoringFunctionIndex = nodeColoringFunctionNames.indexOf(selectedNodeColoringFunctionName)
var selectedNodeColoringFunction = nodeColoringFunctions[selectedNodeColoringFunctionIndex].f

function nodeColoring(graph) {
  var nodeColorValues = graph.nodes.map(d => selectedNodeColoringFunction(d))
  var minNodeColorValue = Math.min(...nodeColorValues)
  var maxNodeColorValue = Math.max(...nodeColorValues)
  var nodeColorValueDiff = maxNodeColorValue - minNodeColorValue
  var leftNodeColorOffset1 = ruleOfThree(
    nodeColorValueDiff,
    nodeColorLimits[1] - nodeColorLimits[0],
    nodeColorLimits[0] - minNodeColorValue
  )
  var rightNodeColorOffset1 = ruleOfThree(
    nodeColorValueDiff,
    nodeColorLimits[1] - nodeColorLimits[0],
    maxNodeColorValue - nodeColorLimits[1]
  )
  var leftNodeColorValue1 = minNodeColorValue - leftNodeColorOffset1
  var rightNodeColorValue1 = maxNodeColorValue + rightNodeColorOffset1
  var nodeColorRange1 = [leftNodeColorValue1, rightNodeColorValue1]
  var nodeColorRange = nodeColorRange1
  var myNodeColor = d3.scaleSequential().domain(nodeColorRange).interpolator(palette)
  
  function color(x) {
    return d3.color(myNodeColor(x)).formatHex()
  }
  return color
}

function ruleOfThree(a, b, c) {
  // a --- b
  // x --- c
  // x?
  // x = (a * c) / b
  return (a * c) / b
}

function straightLineEquation(x1, y1, x2, y2, x) {
  var y = ((y2 - y1) / (x2 - x1)) * (x - x1) + y1
  return y
}

function createGraph(data) {
  const nodes = data.nodes.map(({id, years, n_performances, choreographer, first_date}) => ({
    id,
    sourceLinks: [],
    targetLinks: [],
    years,
    firstYear: Math.min(...years),
    lastYear: Math.max(...years),
    nPerformances: n_performances,
    choreographer: choreographer,
    first_date,
  }));
  const nodeById = new Map(nodes.map(d => [d.id, d]));
  const links = data.links.map(({source, target, value, first_date}) => ({
    source: nodeById.get(source),
    target: nodeById.get(target),
    value,
    first_date
  }));
  for (const link of links) {
    const {source, target, value} = link;
    source.sourceLinks.push(link);
    target.targetLinks.push(link);
  }
  return {nodes, links};
}

// Selection criteria

// Common functions

function fConstant(a) {
  return 0
}

function fFirstDocumentedPerformance(a) {
  return a.firstYear
}

function fLastDocumentedPerformance(a) {
  return a.lastYear
}

function fDegree(a) {
  return d3.sum(a.sourceLinks, l => 1) + d3.sum(a.targetLinks, l => 1)
}

function fWeightedDegree(a) {
  return d3.sum(a.sourceLinks, l => l.value) + d3.sum(a.targetLinks, l => l.value)
}

function fNumberYearsPerformed(a) {
  return a.years.length
}

function fTotalNumberPerformances(a) {
  return a.nPerformances
}

function fChoreographer(a) {
  return a.choreographer == 'AA' ? 1 : 0
}

function fName2(a, b) {
  return d3.ascending(a.id, b.id)
}

function fFirstDocumentedPerformance2(a, b) {
  return (
    d3.ascending(a.first_date, b.first_date) ||
    fName2(a, b)
  )
}

function fDegree2(a, b) {
  return (
    fDegree(b) - fDegree(a) ||
    fName2(a, b)
  )
}

function fWeightedDegree2(a, b) {
  return (
    fWeightedDegree(b) - fWeightedDegree(a) ||
    fName2(a, b)
  )
}

function fNumberYearsPerformed2(a, b) {
  return (
    fNumberYearsPerformed(b) - fNumberYearsPerformed(a) ||
    fName2(a, b)
  )
}

function fTotalNumberPerformances2(a, b) {
  return (
    fTotalNumberPerformances(b) - fTotalNumberPerformances(a) ||
    fName2(a, b)
  )
}

function fSource(l) {
  const n = selectedNodeColoringFunction(l.source);
  return n
}

function fTarget(l) {
  const n = selectedNodeColoringFunction(l.target);
  return n
}

// Node sorting

var nodeSortingFunctions = [
  {f: fName2, name: 'name'},
  {f: fFirstDocumentedPerformance2, name: 'first documented performance'},
  {f: fDegree2, name: 'degree'},
  {f: fWeightedDegree2, name: 'weighted degree'},
  {f: fNumberYearsPerformed2, name: 'number of years performed'},
  {f: fTotalNumberPerformances2, name: 'total number of performances'},
]
var nodeSortingFunctionNames = nodeSortingFunctions.map(x => x.name)
var selectedNodeSortingFunctionIndex = nodeSortingFunctionNames.indexOf(selectedNodeSortingFunctionName)
var selectedNodeSortingFunction = nodeSortingFunctions[selectedNodeSortingFunctionIndex].f

// Node sizing

var nodeSizingFunctions = [
  {f: fConstant, name: '-- all same size --'},
  {f: fFirstDocumentedPerformance, name: 'first documented performance'},
  {f: fDegree, name: 'degree'},
  {f: fWeightedDegree, name: 'weighted degree'},
  {f: fNumberYearsPerformed, name: 'number of years performed'},
  {f: fTotalNumberPerformances, name: 'total number of performances'},
]
var nodeSizingFunctionNames = nodeSizingFunctions.map(x => x.name)
var selectedNodeSizingFunctionIndex = nodeSizingFunctionNames.indexOf(selectedNodeSizingFunctionName)
var selectedNodeSizingFunction = nodeSizingFunctions[selectedNodeSizingFunctionIndex].f

function labelRadiusDarknessScales(graph) {
  var nodeSizeValues = graph.nodes.map(d => selectedNodeSizingFunction(d))
  var minNodeSizeValue = Math.min(...nodeSizeValues)
  var maxNodeSizeValue = Math.max(...nodeSizeValues)
  var nodeSizeRange = [minNodeSizeValue, maxNodeSizeValue]
  
  var minLabelSizeValue = paramMinFS
  var maxLabelSizeValue = paramMaxFS
  var labelSizeRange = [minLabelSizeValue, maxLabelSizeValue]
  var labelLinearScale = minNodeSizeValue < maxNodeSizeValue ?
    d3.scaleLinear(nodeSizeRange, labelSizeRange) :
    (a => Math.min(...labelSizeRange))
  
  var minRadiusValue = paramMinDS
  var maxRadiusValue = paramMaxDS
  var radiusRange = [minRadiusValue, maxRadiusValue]
  var radiusLinearScale = minNodeSizeValue < maxNodeSizeValue ?
    d3.scaleLinear(nodeSizeRange, radiusRange) :
    (a => Math.min(...radiusRange))
  
  return {labelLinearScale, radiusLinearScale}
}

// Link coloring
// nothing here - they take source or target node color


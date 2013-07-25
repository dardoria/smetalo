var hitOptions = {
  segments: true,
  stroke: true,
  fill: true,
  tolerance: 5
};

//drawing stuff
var unitWidth = 60;
var unitHeight = 40;
var hGap = 50;
var vGap = 10;
var cornerSize = new Size(10, 10);

var selectedPath;
var movePath = false;
var taskPath;

//data
var maxTarget;
var targetNumber;

function drawTaskArea(target, vOffset){
  taskPath = makeNumberBar(target, vOffset);
  taskPath.fillColor = 'lightgrey'
  taskPath.data.value = 0;
  taskPath.data.targetValue = target;
  taskPath.data.draggable = false;
}

function makeNumberBar(length, vOffset) {
  var numberBar = new Group();
  for (var i = 0; i < length; i++){
    var rectangle = new Rectangle(new Point(hGap + (unitWidth * i), vOffset), new Size(unitWidth, unitHeight));
    var path = new Path.RoundRectangle(rectangle, cornerSize);
    numberBar.addChild(path);
  }
  return numberBar;
}

function generateNumberBars(selected, max) {
  var vOffset = 0;
  var lightness = (Math.random() - 0.5) * 0.4 + 0.4;
  var hue = Math.random() * 360;
  for (var i = 1; i <= max; i++){
    vOffset = (unitHeight + vGap) * i;
    if (i != selected){
      var path = makeNumberBar(i, vOffset);
      path.fillColor = { hue: hue, saturation: 1, lightness: lightness };
      path.data.value = i;
      path.data.draggable = true;
    } else {
      drawTaskArea(selected, vOffset);
    }
  }
}

function main() {
  maxTarget = 10;
  targetNumber = getRandomInt(2, maxTarget);
  generateNumberBars(targetNumber, maxTarget);
}

function onMouseDown(event) {
  selectedPath = null;
  var hitResult = project.hitTest(event.point, hitOptions);
  if (!hitResult) {
    return;
  }

  selectedPath = cloneItem(hitResult.item.parent);
  console.log(selectedPath.data.value);

  movePath = hitResult.type == 'fill' && isItemDraggable(selectedPath);
  if (movePath) {
    project.activeLayer.addChild(hitResult.item);
  }
}

function onMouseMove(event) {
  project.activeLayer.selected = false;
  if (isItemDraggable(event.item)){
    event.item.selected = true;
  }
}

function onMouseDrag(event) {
  if (movePath) {
    selectedPath.position += event.delta;
  }
}

function onMouseUp(event) {
  if (movePath){
    movePath = false;
    var hitResult = taskPath.getBounds().intersects(selectedPath.getBounds());
    if (hitResult && ((selectedPath.data.value + taskPath.data.value) <= taskPath.data.targetValue)) {
      selectedPath.data.draggable = false;
      var insertPos = taskPath.data.value > 0 ? taskPath.bounds.x + (unitWidth * taskPath.data.value) : taskPath.bounds.x;
      selectedPath.position = new Point(insertPos + getItemWidth(selectedPath) / 2, taskPath.position.y);
      taskPath.data.value += selectedPath.data.value;


    } else {
      selectedPath.remove();
    }
  }
}

function getItemWidth(item) {
  return unitWidth * item.data.value;

}
function cloneItem(item) {
  var copy = item.clone();
  copy.data.value = item.data.value;
  copy.data.draggable = item.data.draggable;
  return copy;
}

function isItemDraggable(item){
  return item && item.data.draggable;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
main();


var hitOptions = {
  segments: true,
  stroke: true,
  fill: true,
  tolerance: 5
};

//paper.js stuff
var selectedPath;
var movePath = false;

//drawing stuff
var unitWidth = 60;
var unitHeight = 40;
var vGap = 10;
var vGapTask = unitHeight + vGap;
var cornerSize = new Size(10, 10);
var path;
var taskPath;

//data
var maxTarget;
var targetNumber;

function drawTaskArea(target, vOffset){
  var rectangle = new Rectangle(new Point(50, (unitHeight + vGap) * (target + 1)), new Size(unitWidth * target, unitHeight));
  taskPath = new Path.RoundRectangle(rectangle, cornerSize);
  taskPath.fillColor = 'lightgrey'
  taskPath.data.value = 0;
  taskPath.data.targetValue = target;
  taskPath.data.draggable = false;
}

function generateNumberBars(selected, max) {
  var vOffset = 0;

  for (var i = 1; i <= max; i++){
    var lightness = (Math.random() - 0.5) * 0.4 + 0.4;
    var hue = Math.random() * 360;

    if (i < selected){
      vOffset = (unitHeight + vGap) * i;
    } else if (i == selected) {
      vOffset = (unitHeight + vGap) * i;
      drawTaskArea(selected, vOffset);
    } else {
      vOffset = ((unitHeight + vGap) * i) + vGapTask;
    }
    var rectangle = new Rectangle(new Point(50, vOffset), new Size(unitWidth * i, unitHeight));
    path = new Path.RoundRectangle(rectangle, cornerSize);
    path.fillColor = { hue: hue, saturation: 1, lightness: lightness };
    path.data.value = i;
    path.data.draggable = selected != i;
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

  selectedPath = cloneItem(hitResult.item);

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
    console.log(taskPath);
    var hitResult = taskPath.getBounds().intersects(selectedPath.getBounds());
    if (hitResult && ((selectedPath.data.value + taskPath.data.value) <= taskPath.data.targetValue)) {
      taskPath.data.value += selectedPath.data.value;
      selectedPath.data.draggable = false;
    } else {
      selectedPath.remove();
    }
  }
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


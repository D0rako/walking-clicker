var Main = {};
var Data = {};

Main.VERSION = "0.1.2";

Main.descriptions =[
	"Tall mountains surround you, a few trees braving the harsh altitudes.",
	"Waves lap calmly against the peaceful beach.",
	"Thick snow blankets the ground for as far as the eye can see.",
	"The endless forest is covered in a thin layer of snow.",
	"Tall shrubbery is the only thing breaking the monotony of flat grasslands.",
	"Vine-covered trees fight one another for a small glint of light, far up beyond the canopy.",
	"The harsh winds pick up sand from the near-by dunes, blanketing the area in a haze."
];
Main.exploreFailures =[
	"You struggle to get on top of a nearby hill, but see nothing...",
	"You found nothing...",
	"You look around the area, but fail to find anything...",
	"You use a nearby tree to scout the area, but fail to see anything of note...",
	"Nothing nearby catches your eye..."
];
Main.resourceNames = [
	"explore", "wood", "stone", "sand", "coal", "iron", "glass", "iron bar", "food", "cooked food", "bait"
];

Main.itemList = [];
function Item(args){
	this.name = args.name;
	this.desc = args.desc;
	this.chanceModifier = args.chanceModifier||1;
	this.type = args.type||"tool";
	
	this.price = [];
	this.price.push(this.price[Main.resourceNames[0]] = 0);
	this.price.push(this.price[Main.resourceNames[1]] = args.woodPrice||0);
	this.price.push(this.price[Main.resourceNames[2]] = args.stonePrice||0);
	this.price.push(this.price[Main.resourceNames[3]] = args.sandPrice||0);
	this.price.push(this.price[Main.resourceNames[4]] = args.coalPrice||0);
	this.price.push(this.price[Main.resourceNames[5]] = args.ironPrice||0);
	this.price.push(this.price[Main.resourceNames[6]] = args.glassPrice||0);
	this.price.push(this.price[Main.resourceNames[7]] = args.ironBarPrice||0);
	this.price.push(this.price[Main.resourceNames[8]] = args.foodPrice||0);
	this.price.push(this.price[Main.resourceNames[9]] = args.cookedFoodPrice||0);
	this.price.push(this.price[Main.resourceNames[10]] = args.baitPrice||0);
	
	this.displayFunction = args.displayFunction||0;
	this.maxUses = args.maxUses||0;
	
	this.cookTime = args.cookTime||0;
	
	this.id = Main.itemList.push(this) - 1;
	Main.itemList[args.name] = this;
	return this;
};

Main.smeltList = [];
function Recipe(args){
	this.name = args.name;
	this.desc = args.desc;
	this.price = args.price;//effective wood price (coal = 1/4th)
	this.outputType = args.type||"resource";
	this.outputID = args.outputID;
	
	this.takeResources = args.takeResources||[];
	this.displayFunction = args.displayFunction||0;
	
	this.id = Main.smeltList.push(this) - 1;
	Main.smeltList[args.name] = this;
	return this;
};

Main.NOTI_LIST_LENGTH = 6;
Main.notificationList = [];

// oh boy! CHEATING!

// infinite EVERYTHING (except explore)
motherlode=function(){
	for(var i=1;i<Main.resourceNames.length;i++){
		Main.addResource(Main.resourceNames[i], 9999);
	}
	Main.redrawView();
};

// sets explore to 100% and all benefits this confers
ivewalked5thousandmiles=function(){
	Data.foundGrove = true;
	Data.foundQuarry = true;
	Data.foundBeach = true;
	Main.addResource("explore", 1000);
	Main.redrawView();
};

// sets current smelted item times to 9999
waitforit=function(){
	for(var i=0;i<Data.smeltingItems.length;i++){
		Data.smeltingItems[i].time = 9999;
	}
};

// sets current smelted item times to 1
throughthefireandflames=function(){
	for(var i=0;i<Data.smeltingItems.length;i++){
		Data.smeltingItems[i].time = 1;
	}
};

Main.getElement=function(id){
	return document.getElementById(id);
};

Main.unlockGrove=function(){
	Main.addNotification("You found a tree grove!", true);
	Data.foundGrove = true;
	Main.getElement("groveButton").style.visibility = "visible";
};

Main.unlockQuarry=function(){
	Main.addNotification("You found a vein of stone!", true);
	Data.foundQuarry = true;
	Main.getElement("mineButton").style.visibility = "visible";
};

Main.unlockBeach=function(){
	Main.addNotification("You found a sandy outcrop, perfect for digging!", true);
	Data.foundBeach = true;
	Main.getElement("sandButton").style.visibility = "visible";
};

Main.explore=function(){
	if(Data.exploreAmount >= 1000){
		Main.addNotification("You find nothing, as you roam well-familiar lands.");
		Main.setResource("explore", 1000);
	}
	else{
		exploration = 1;
		if(Main.isItemOwned("Manufactored Landmark")) exploration *= 2;
		Main.addResource("explore", exploration);
		// found grove - 5 - 55%
		if(!Data.foundGrove && Main.getResource("explore") >= Math.floor(Math.random()*500+50)){
			Main.unlockGrove();
		}
		// found quarry - 15 - 65%
		else if(!Data.foundQuarry && Main.getResource("explore") >= Math.floor(Math.random()*500+150)){
			Main.unlockQuarry();
		}
		// found beach - 30 - 80%
		else if(!Data.foundBeach && Main.getResource("explore") >= Math.floor(Math.random()*500+300)){
			Main.unlockBeach();
		}
		else{
			Main.randomNotification(Main.exploreFailures);
		}
	}
	Main.redrawView();
};

Main.cutWood=function(){
	if(Data.foundGrove){
		if(Main.isItemOwned("Stone Axe")) Main.cutWithTool(false, "Stone Axe", "The stone head breaks in twain from the trunk.");
		else Main.cutWithTool(true);
	}
	else Main.addNotification("Grove? What grove? You don't see any grove here!");
	Main.redrawView();
};

Main.cutWithTool=function(isHands, itemID, breakMessage){
	if(Math.random()*10 <= (isHands?1:2 * Main.itemList[itemID].chanceModifier)){
		Main.addNotification("You manage to get some usable wood!");
		Main.addResource("wood", 1);
		if(!isHands) Main.useItem(itemID, breakMessage);
	}
	else{
		Main.addNotification("You struggle against the bark...");
	}
};

Main.mine=function(){
	if(Data.foundQuarry || Data.ownedItemList[Main.itemList["Mine"].id]){
		if(Main.isItemOwned("Wooden Pickaxe")) Main.mineWithTool("Wooden Pickaxe", "As expected, the wooded axehead broke.");
		else if(Main.isItemOwned("Stone Pickaxe")) Main.mineWithTool("Stone Pickaxe", "The chipped axehead crumbles to pieces.");
		else Main.addNotification("You don't have a tool to mine with!");
	}
	else Main.addNotification("You need a place to mine, first!");
	Main.redrawView();
};

Main.mineWithTool=function(itemID, breakMessage){
	if(!Main.isItemOwned("Mine")){
		if(Math.random()*10 <= 1 * Main.itemList[itemID].chanceModifier){
			Main.addResource("stone", 1);
			Main.addNotification("You break a chunk of stone off!");
			Main.useItem(itemID, breakMessage);
		}
		else Main.addNotification("You fail to break a piece loose...");
	}
	else{
		rand = Math.random()*1000;
		if(rand <= 150 * Main.itemList[itemID].chanceModifier){
			Main.addResource("stone", 1);
			Main.addNotification("You break a chunk of stone off!");
			Main.useItem(itemID, breakMessage);
		}
		else if(rand <= 165 * Main.itemList[itemID].chanceModifier){
			Main.addResource("coal", 1);
			Main.addNotification("You find some coal within the debris!");
			Main.useItem(itemID, breakMessage);
		}
		else if(rand <= 170 * Main.itemList[itemID].chanceModifier){
			Main.addResource("iron", 1);
			Main.addNotification("The stone breaks away to reveal some iron!");
			Main.useItem(itemID, breakMessage);
		}
		else Main.addNotification("You fail to break a piece loose...");
	}
};

Main.digSand=function(){
	if(Data.foundBeach){
		if(Main.isItemOwned("Stone Shovel")) Main.digWithTool("Stone Shovel", "The shovel-head finally breaks from wear and tear.");
		else Main.addNotification("You don't have anything to dig with!");
	}
	else Main.addNotification("You need a place to dig sand from, first!");
	Main.redrawView();
};

Main.digWithTool=function(itemID, breakMessage){
	Main.addResource("sand", 1);
	Main.addNotification("You dig up some sand!");
	Main.useItem(itemID, breakMessage);
};

Main.smeltItem=function(itemID, resourceType){
	if(Data.smeltingItems.length > Data.maxFurnaces){
		Main.addNotification("All your furnaces are running full-blast, silly!");
		return;
	}
	recipeData = Main.smeltList[itemID];
	if(recipeData.displayFunction == 0 || !recipeData.displayFunction()){
		Main.addNotification("...How did you even DO that?");
		return;
	}
	for(var i=0;i<recipeData.takeResources.length;i++){
		if(!Main.hasResource(recipeData.takeResources[i].name, recipeData.takeResources[i].amount)){
			Main.addNotification("Not enough " + recipeData.takeResources[i].name + "!");
			return;
		}
	}
	priceModifier = 1;
	if(resourceType == "coal")priceModifier = 1/4;
	if(!Main.hasResource(resourceType, recipeData.price * priceModifier)){
		Main.addNotification("Not enough " + resourceType + "!");
		return;
	}
	// alright checks are done LETS SMELT
	Main.addResource(resourceType, recipeData.price * priceModifier * -1);
	for(var i=0;i<recipeData.takeResources.length;i++){
		Main.addResource(recipeData.takeResources[i].name, recipeData.takeResources[i].amount * -1);
	}
	Data.smeltingItems.push({id:itemID, time:recipeData.price * 20});
	Main.addNotification("Now cooking " + recipeData.name);
	Main.redrawView();
};

Main.workFurnace=function(){
	for(var i=0;i<Data.smeltingItems.length;i++){
		Data.smeltingItems[i].time--;
		if(Data.smeltingItems[i].time <= 0){
			smelted = Data.smeltingItems[i].id;
			Main.addNotification(Main.smeltList[smelted].name + " has finished being cooked!", true);
			Main.addResource(Main.smeltList[smelted].outputID, 1);
			Main.addNotification("Retrieved a " + Main.smeltList[smelted].outputID + " from the furnace!");
			Data.smeltingItems.splice(i, 1);
		}
	}
};

Main.viewZone=function(){
	Main.getElement("currentZone").style.display = "inline";
	Main.getElement("buildList").style.display = "none";
	Main.getElement("furnaceDisplay").style.display = "none";
};

Main.viewTable=function(){
	Main.getElement("currentZone").style.display = "none";
	Main.getElement("buildList").style.display = "inline";
	Main.getElement("furnaceDisplay").style.display = "none";
};

Main.viewFurnace=function(){
	Main.getElement("currentZone").style.display = "none";
	Main.getElement("buildList").style.display = "none";
	Main.getElement("furnaceDisplay").style.display = "inline";
};

Main.redrawView=function(){
	Main.redrawStats();
	Main.redrawNotificationField();
	Main.redrawShop();
	Main.redrawOwnedItems();
	Main.redrawHeader();
	Main.redrawFurnace();
	Main.displayInvisibles();
};

Main.redrawStats=function(){
	Main.getElement("zoneDescription").innerHTML = Main.descriptions[Data.areaDescNo];
	Main.getElement("explorePercent").innerHTML = "Exploration: " + Main.getResource("explore")/10 + "%";
	Main.getElement("woodOwned").innerHTML = "Wood: " + Main.getResource("wood");
	Main.getElement("stoneOwned").innerHTML = "Stone: " + Main.getResource("stone");
	Main.getElement("sandOwned").innerHTML = "Sand: " + Main.getResource("sand");
	Main.getElement("coalOwned").innerHTML = "Coal: " + Main.getResource("coal");
	Main.getElement("ironOwned").innerHTML = "Iron: " + Main.getResource("iron");
	Main.getElement("glassOwned").innerHTML = "Glass: " + Main.getResource("glass");
};

Main.redrawShop=function(){
	outputString = "Buildable Items:</br>";
	for(var i=0;i<Main.itemList.length;i++){
		if(!Main.isItemOwned(i) && (Main.itemList[i].displayFunction == 0 || Main.itemList[i].displayFunction())) outputString += "<input type=\"button\" onclick=\"Main.buyItem(" + i + ")\" value=\"" + Main.itemList[i].name + "\"></input></br>" + Main.itemList[i].desc + "</br>Cost: " + Main.calculateItemPriceLine(i) + "</br>";
	}
	if(outputString == "Buildable Items:</br>") outputString += "None!";
	Main.getElement("buildList").innerHTML = outputString;
};

Main.calculateItemPriceLine=function(itemID){
	outputString = "";
	for(var i=1;i<Main.resourceNames.length;i++){
		outputString += Main.statePrice(itemID, i);
		outputString += Main.checkForAfterPrices(itemID, i);
	}
	return outputString;
};

Main.statePrice=function(itemID, resource){
	return (Main.getItemCost(itemID, resource)?Main.getItemCost(itemID, resource) + " " + Main.resourceNames[resource]:"")
};

Main.checkForAfterPrices=function(itemID, resourceID){
	if(Main.getItemCost(itemID, resourceID)){
		for(var i = resourceID + 1;i<Main.resourceNames.length;i++){
			if(Main.getItemCost(itemID, i)) return ", "
		}
	}
	return " ";
};

Main.redrawOwnedItems=function(){
	outputString = "Owned Items:</br>";
	for(var i=0;i<Main.itemList.length;i++){
		if(Main.isItemOwned(i)) outputString += Main.itemList[i].name +	": " + Main.itemList[i].desc + (Data.ownedItemData[i].uses != 0?" (" + Data.ownedItemData[i].uses + (Data.ownedItemData[i].uses == 1?" use":" uses") + ")":"") + "</br>";
	}
	if(outputString == "Owned Items:</br>") outputString += "None!";
	Main.getElement("ownedList").innerHTML = outputString;
};

Main.redrawHeader=function(){
	Main.getElement("header").innerHTML = "<a id=\"goToZone\" onclick=\"Main.viewZone()\">Wilderness</a> | <a id=\"goToTable\" onclick=\"Main.viewTable()\">Construction</a>" + (Main.isItemOwned("Furnace")?" | <a id=\"goToFurnace\" onclick=\"Main.viewFurnace()\">Furnace</a>":"") + " | <a id=\"goToInventory\" onclick=\"Main.viewInventory()\">Inventory</a>";
};

Main.redrawFurnace=function(){
	outputString = "";
	if(Data.smeltingItems.length < Data.maxFurnaces){
		outputString += "Recipes:</br>";
		for(var i=0;i<Main.smeltList.length;i++){
			if(Main.smeltList[i].displayFunction == 0 || Main.smeltList[i].displayFunction()) outputString += Main.smeltList[i].name + "</br>" + Main.smeltList[i].desc + "</br>Cost: " + Main.stateSmeltPrice(i) + "</br>" + "<input type=\"button\" onclick=\"Main.smeltItem(" + i + ", 'wood')\" value=\"Smelt with wood\"></input> <input type=\"button\" onclick=\"Main.smeltItem(" + i + ", 'coal')\" value=\"Smelt with coal\"></input></br>";
		}
		if(outputString == "Recipes:</br>") outputString += "None!";
	}
	else{
		outputString += "Not enough furnaces to use recipes!";
	}
	// and now for the times!
	if(Data.smeltingItems.length){
		outputString += "</br>Items being cooked:</br>";
		for(var i=0;i<Data.smeltingItems.length;i++){
			outputString += Main.smeltList[Data.smeltingItems[i].id].name + ": " + Data.smeltingItems[i].time + " seconds until finished.";
			if(!i == Data.smeltingItems.length - 1) outputString += "</br>";
		}
	}
	outputString += "</br>And upgrading your furnace count'll go here, eventually.";
	Main.getElement("cookableItems").innerHTML = outputString;
};

Main.stateSmeltPrice=function(recipeID){
	outputString = "";
	for(var i=0;i<Main.smeltList[recipeID].takeResources.length;i++){
		outputString += Main.smeltList[recipeID].takeResources[i].amount + " " + Main.smeltList[recipeID].takeResources[i].name;
		if(i == Main.smeltList[recipeID].takeResources.length - 1) outputString += " and ";
		else outputString += ", ";
	}
	outputString += Main.smeltList[recipeID].price + " wood or " + Math.ceil(Main.smeltList[recipeID].price/4) + " coal";
	return outputString;
};

Main.displayInvisibles=function(){
	if(Main.hasResource("wood")) Main.getElement("woodOwned").style.visibility = "visible";
	if(Main.hasResource("stone")) Main.getElement("stoneOwned").style.visibility = "visible";
	if(Main.hasResource("sand")) Main.getElement("sandOwned").style.visibility = "visible";
	if(Main.hasResource("coal")) Main.getElement("coalOwned").style.visibility = "visible";
	if(Main.hasResource("iron")) Main.getElement("ironOwned").style.visibility = "visible";
	if(Main.hasResource("glass")) Main.getElement("glassOwned").style.visibility = "visible";
	if(Main.hasResource("iron bar")) Main.getElement("ironBarOwned").style.visibility = "visible";
	if(Main.isItemOwned("Wooden Pickaxe") || Data.foundQuarry) Main.getElement("mineButton").style.visibility = "visible";
	if(Main.hasResource("wood", 4) || Data.builtFirstItem) Main.getElement("header").style.visibility = "visible";
	if(Data.builtFirstItem) Main.getElement("ownedList").style.visibility = "visible";
	if(Main.isItemOwned("Stone Shovel") || Data.foundBeach) Main.getElement("sandButton").style.visibility = "visible";
	if(Data.foundGrove) Main.getElement("groveButton").style.visibility = "visible";
};

Main.undisplayUninvisibles=function(){
	Main.getElement("woodOwned").style.visibility = "hidden";
	Main.getElement("stoneOwned").style.visibility = "hidden";
	Main.getElement("sandOwned").style.visibility = "hidden";
	Main.getElement("coalOwned").style.visibility = "hidden";
	Main.getElement("ironOwned").style.visibility = "hidden";
	Main.getElement("glassOwned").style.visibility = "hidden";
	Main.getElement("ironBarOwned").style.visibility = "hidden";
	Main.getElement("mineButton").style.visibility = "hidden";
	Main.getElement("header").style.visibility = "hidden";
	Main.getElement("ownedList").style.visibility = "hidden";
	Main.getElement("sandButton").style.visibility = "hidden";
	Main.getElement("groveButton").style.visibility = "hidden";
	Main.getElement("mineButton").style.visibility = "hidden";
	Main.getElement("sandButton").style.visibility = "hidden";
};

Main.buyItem=function(itemID){
	if(Main.itemList[itemID].displayFunction == 0 || Main.itemList[itemID].displayFunction()){
		if(!Main.isItemOwned(itemID)){
			if(Main.canAfford(itemID)){
				for(var i=0;i<Main.resourceNames.length;i++) Main.addResource(Main.resourceNames[i], Main.getItemCost(itemID, Main.resourceNames[i]) * -1);
				Data.ownedItemData[itemID].owned = true;
				Data.ownedItemData[itemID].uses = Main.itemList[itemID].maxUses;
				Main.addNotification("Made a " + Main.itemList[itemID].name + "!");
				Data.builtFirstItem = true;
			}
		}
		else Main.addNotification("Already built!");
	}
	else Main.addNotification("...How did you DO that?");
	Main.redrawView();
};

Main.useItem=function(itemID, breakMessage){
	Data.ownedItemData[Main.itemList[itemID].id].uses--;
	if(Data.ownedItemData[Main.itemList[itemID].id].uses <= 0){
		Main.destroyItem(itemID);
		Main.addNotification(breakMessage, true);
	}
};

Main.destroyItem=function(itemID){
	Data.ownedItemData[Main.itemList[itemID].id].owned = false;
};

Main.canAfford=function(itemID){
	for(var i=0;i<Main.resourceNames.length;i++){
		if(!Main.hasResource(Main.resourceNames[i], Main.getItemCost(itemID, i))){
			Main.addNotification("Not enough " + Main.resourceNames[i] + "!");
			return false;
		}
	}
	return true;
};

Main.isItemOwned=function(itemID){
	return Data.ownedItemData[itemID].owned;
};

Main.getItemCost=function(itemID, resource){
	return Main.itemList[itemID].price[Main.resourceNames[resource]] || Main.itemList[itemID].price[resource];
}

Main.addResource=function(resource, amount){
	Data.resourceList[resource].amount += amount;
};

Main.hasResource=function(resource, amount){
	// returns true if zero (because second line prevents that (which is there so i can lazily not put in amounts (my god there are a lot of parenthesis in this comment)))
	if(amount == 0) return true;
	truAmount = amount||1;
	return Data.resourceList[resource].amount >= truAmount
};

Main.getResource=function(resource){
	return Data.resourceList[resource].amount;
}

Main.randomNotification=function(messageArray){
	Main.addNotification(messageArray[Math.floor(Math.random()*messageArray.length)]);
};

Main.addNotification=function(message, emphasise){
	brandColour = emphasise||false;
	if(brandColour) message = "<em>" + message + "</em>";
	if(Main.notificationList.length >= Main.NOTI_LIST_LENGTH){
		Main.notificationList.shift();
	}
	Main.notificationList.push(message);
};

Main.redrawNotificationField=function(){
	var notificationOutput = "Notifications:</br>";
	for(var i = 0; i < Main.NOTI_LIST_LENGTH; i++){
		if(Main.notificationList[i]){
			notificationOutput += Main.notificationList[i] + "</br>";
		}
	}
	Main.getElement("notificationList").innerHTML = notificationOutput;
	return notificationOutput;
};

Main.initialiseZone=function(){
	Data.areaDescNo = Math.floor(Math.random()*6);
};

Main.saveGame=function(){
	localStorage['mineSave'] = btoa(JSON.stringify(Data));
	Main.addNotification("Game saved!");
	Main.redrawNotificationField();
};

Main.getSaveString=function(){
	if(!(localStorage['mineSave'] === undefined)) return JSON.parse(atob(localStorage['mineSave']));
	return undefined
};

Main.loadGame=function(){
	Data = JSON.parse(atob(localStorage['mineSave']));
	Main.notificationList = [];
	Main.addNotification("Game loaded!");
	if(Data.savedVersion = "0.1.1"){
		Data.smeltingItems = [];
		Data.savedVersion = "0.1.2";
	}
	// generic 'add new item/resource data if there isn't any' logic
	if(Data.savedVersion != Data.VERSION){
		for(var i=Data.ownedItemData;i<Main.itemList.length;i++){
			Data.ownedItemData.push(Data.ownedItemData[Main.itemList[i].name] = {});
			Data.ownedItemData[i].owned = false;
			Data.ownedItemData[i].uses = 0;
			Data.ownedItemData[i].name = Main.itemList[i].name;
		}
		for(var i=Data.resourceList.length;i<Main.resourceNames.length;i++){
			Data.resourceList.push(Data.resourceList[Main.resourceNames[i]] = {});
			Data.resourceList[i].amount = 0;
			Data.resourceList[i].name = Main.resourceNames[i];
		}
	}
	Data.savedVersion = Main.VERSION;
	// apparently saves don't store string array references (admittantly still amazed they can use string references at all)
	for(var i=0;i<Main.itemList.length;i++){
		Data.ownedItemData[Data.ownedItemData[i].name] = Data.ownedItemData[i]
	}
	for(var i=0;i<Main.resourceNames.length;i++){
		Data.resourceList[Data.resourceList[i].name] = Data.resourceList[i]
	}
	Main.undisplayUninvisibles();
	Main.redrawView();
};

Main.resetGame=function(){
	Main.initialiseZone();
	Data.foundGrove = false;
	Data.foundQuarry = false;
	Data.foundBeach = false;
	Data.builtFirstItem = false;
	Data.ownedItemData = [];
	for(var i=0;i<Main.itemList.length;i++){
		Data.ownedItemData.push(Data.ownedItemData[Main.itemList[i].name] = {});
		Data.ownedItemData[i].owned = false;
		Data.ownedItemData[i].uses = 0;
		Data.ownedItemData[i].name = Main.itemList[i].name;
	}
	Data.resourceList = [];
	for(var i=0;i<Main.resourceNames.length;i++){
		Data.resourceList.push(Data.resourceList[Main.resourceNames[i]] = {});
		Data.resourceList[i].amount = 0;
		Data.resourceList[i].name = Main.resourceNames[i];
	}
	Data.smeltingItems = [];
	Data.maxFurnaces = 1;
	Data.savedVersion = Main.VERSION;
	Main.notificationList = [];
	Main.undisplayUninvisibles();
	Main.redrawView();
};

Main.initialiseItems=function(){
	new Item({name:"Wooden Pickaxe", desc:"Strike the earth!", woodPrice:4, maxUses:1, displayFunction:function(){
		return Main.isItemOwned("Crafting Table");
	}});
	new Item({name:"Stone Pickaxe", desc:"Strike the earth more!", woodPrice:2, stonePrice:3, maxUses:6, chanceModifier:1.2, displayFunction:function(){
		return (Main.hasResource("stone") && Main.isItemOwned("Crafting Table"));
	}});
	new Item({name:"Iron Pickaxe", desc:"Mine through rock like a hot... pickaxe... mines through rock! (? uses)", displayFunction:function(){
		return false;
	}});
	new Item({name:"Gold Pickaxe", desc:"Give your sharp pointey thing the capacity for enchanting! (? uses)", displayFunction:function(){
		return false;
	}});
	new Item({name:"Diamond Pickaxe", desc:"Yeah, this earth-striking thing is getting ridiculous. (? uses)", displayFunction:function(){
		return false;
	}});
	new Item({name:"Steel Pickaxe", desc:"The deceased souls give it an extra KICK! (? uses)", displayFunction:function(){
		return false;
	}});
	new Item({name:"Stone Axe", desc:"Doubles wood-cutting efficency, and can also be used as a weapon.", woodPrice:2, stonePrice:2, maxUses:50, displayFunction:function(){
		return (Main.hasResource("stone") && Main.isItemOwned("Crafting Table"));
	}});
	new Item({name:"Iron Axe", desc:"That tree never knew what was coming! (? uses)", displayFunction:function(){
		return false;
	}});
	new Item({name:"Gold Axe", desc:"Wait, isn't gold WEAKER than wood? (? uses)", displayFunction:function(){
		return false;
	}});
	new Item({name:"Diamond Axe", desc:"Clearly you've been on 'Pimp My Tools'... (? uses)", displayFunction:function(){
		return false;
	}});
	new Item({name:"Steel Axe", desc:"Fell trees with the screams of the departed! (? uses)", displayFunction:function(){
		return false;
	}});
	new Item({name:"Stone Shovel", desc:"Allows the gathering of sand as well as building basic infrastructure", woodPrice:2, stonePrice:1, maxUses:50, displayFunction:function(){
		return (Main.hasResource("stone") && Main.isItemOwned("Crafting Table"));
	}});
	new Item({name:"Iron Shovel", desc:"Dig to China! (? uses)", displayFunction:function(){
		return false;
	}});
	new Item({name:"Gold Shovel", desc:"Dig to China, but while getting more sand! (? uses)", displayFunction:function(){
		return false;
	}});
	new Item({name:"Diamond Shovel", desc:"Dig to the MOO- wait what do you mean that's impossible (? uses)", displayFunction:function(){
		return false;
	}});
	new Item({name:"Steel Shovel", desc:"Dig to Hell itself<sup>not really</sup>! (? uses)", displayFunction:function(){
		return false;
	}});
	new Item({name:"Iron Hoe", desc:"Enable the building and use of farms* (? uses) <sup>*seeds not included</sup>", woodPrice:2, ironBarPrice:2, displayFunction:function(){
		return Main.hasResource("iron bar") && Main.isItemOwned("Crafting Table");
	}});
	new Item({name:"Gold Hoe", desc:"Because shining dirt-rakes are the best dirt-rakes. (? uses)", displayFunction:function(){
		return false;
	}});
	new Item({name:"Diamond Hoe", desc:"Holy cow you don't really want to make a hoe out of DIAMOND do you (? uses)", displayFunction:function(){
		return false;
	}});
	new Item({name:"Steel Hoe", desc:"Sealed-up dead people make the best fertiliser! (? uses)", displayFunction:function(){
		return false;
	}});
	new Item({name:"Iron Sword", desc:"Can be used to inflict damage. (? uses)", displayFunction:function(){
		return false;
	}});
	new Item({name:"Gold Sword", desc:"Probably less effective than an Iron sword, but eh, it's your gold. (? uses)", displayFunction:function(){
		return false;
	}});
	new Item({name:"Diamond Sword", desc:"WARNING: Enemies may not last long enough to provide a challenge. (? uses)", displayFunction:function(){
		return false;
	}});
	new Item({name:"Steel Sword", desc:"A vicious cycle; use the deceased to make more deceased! (? uses)", displayFunction:function(){
		return false;
	}});
	new Item({name:"Crafting Table", desc:"Allows building of basic-grade tools and items.", woodPrice:4, type:"building", displayFunction:function(){
		return (Main.hasResource("wood", 4));
	}});
	new Item({name:"Furnace", desc:"Allows smelting ores and cooking foodstuffs with wood or coal.", stonePrice:8, type:"building", displayFunction:function(){
		return (Main.hasResource("stone") && Main.isItemOwned("Crafting Table"));
	}});
	new Item({name:"Mine", desc:"Time to start making an ACTUAL dent in the ground. (improves mining-based output)", woodPrice:6, stonePrice:24, type:"building", displayFunction:function(){
		return Main.isItemOwned("Stone Pickaxe") && Main.isItemOwned("Crafting Table");
	}});
	new Item({name:"Manufactored Landmark", desc:"Doubles exploration rate.", woodPrice:4, stonePrice:8, coalPrice:4, type:"building", displayFunction:function(){
		return Main.hasResource("coal");
	}});
	new Item({name:"Fishing Rod", desc:"Use the bountiful ocean to add to your bountiful gullet!<br>Or using a river, I guess.", woodPrice:2, baitPrice:5, ironPrice:1, maxUses:50, displayFunction:function(){
		return Main.hasResource("iron") && Main.isItemOwned("Crafting Table");
	}});
	new Item({name:"Farm", desc:"Produces a minor amount of cloth once in a blue moon.", woodPrice:84, coalPrice:9, type:"building", displayFunction:function(){
		return Main.isItemOwned("Iron Hoe") && Main.isItemOwned("Crafting Table");
	}});
};

Main.initialiseRecipes=function(){
	new Recipe({name:"Iron Bar", desc:"Used to make low-level tools.", price:36, outputID:"iron bar", takeResources:[{name:"iron", amount:9}], displayFunction:function(){
	return Main.hasResource("iron");
	}});
	new Recipe({name:"Gold Bar", desc:"???", outputID:"gold bar", takeResources:[{name:"gold", amount:9}], displayFunction:function(){
	return false;
	}});
	new Recipe({name:"Diamond Chunk", desc:"???", outputID:"diamond bar", takeResources:[{name:"diamond", amount:9}], displayFunction:function(){
	return false;
	}});
	new Recipe({name:"Steel Bar", desc:"???", outputID:"steel bar", takeResources:[{name:"iron", amount:9}], displayFunction:function(){
	return false;
	}});
	new Recipe({name:"Glass", desc:"Used for a variety of automation-based machinery.", price:2, outputID:"glass", takeResources:[{name:"sand", amount:1}], displayFunction:function(){
	return Main.hasResource("sand")
	}});
	new Recipe({name:"Cooked Food", desc:"What you use to not starve.", price:1, outputID:"cooked food", takeResources:[{name:"food", amount:1}], displayFunction:function(){
	return Main.hasResource("food")
	}});
};

window.setInterval(function(){
	Main.workFurnace();
	Main.redrawView();
}, 1000);

window.onload=function(){
	Main.initialiseItems();
	Main.initialiseRecipes();
	if(!(Main.getSaveString() === undefined)) Main.loadGame();
	else Main.resetGame();
	Main.getElement("version").innerHTML = "Version " + Main.VERSION;
	Main.redrawView();
};
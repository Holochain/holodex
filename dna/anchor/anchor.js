function genesis() {
  //addAnchor();
  return true;
}

//USED IN GENESIS TO ADD THE INITIAL ANCHOR

function getMainAchorHash()
{
  var anchorMain = {Anchor_Type:"Anchor_Type",Anchor_Text:""};
  var hashAnchorMain = makeHash(anchorMain);
  return hashAnchorMain;
}

function getAnchorTypeHash(anchor_type)
{
  var anchorType = {Anchor_Type:anchor_type,Anchor_Text:""};
  var anchorTypeHash = makeHash(anchorType);
  return anchorTypeHash;
}
function addAnchor()
{
  var dna = App.DNA.Hash;
  var anchor_main = {Anchor_Type:"Anchor_Type",Anchor_Text:""};
  var anchor_main_hash=commit("anchor",anchor_main);
  //debug("Entered addAnchor - main hash - "+anchor_main_hash);
  commit("anchor_links", {Links:[{Base:dna,Link:anchor_main_hash,Tag:"Anchor"}]});
  var lnk = getLink(dna,"Anchor",{Load : true});
  //debug("Main anchor hash on link - "+lnk);
  return lnk.Links[0].H;
}

//USED TO CREATE A NEW Anchor_Type
function anchor_type_create(anchor_type)
{
  var anchor_main_hash=getMainAchorHash();
  var new_anchorType= {Anchor_Type:anchor_type,Anchor_Text:""};
  var key=commit("anchor",new_anchorType);
  commit("anchor_links",{Links:[{Base:anchor_main_hash,Link:key,Tag:"Anchor_Type"}]});
  var anctyplnk= getLink(anchor_main_hash,"Anchor_Type",{Load:true});
  return anctyplnk.Links[0].H;
}

function anchor_create(new_anchor)
{
  debug("Anchor create function : ");
  debug("Anchor type : "+new_anchor.Anchor_Type);
  debug("Anchor type : "+new_anchor.Anchor_Text);
  //new_anchor = {Anchor_Type:new_anchor.Anchor_Type,Anchor_Text:new_anchor.Anchor_Text};
  var new_anchorHash=commit("anchor",new_anchor);
  debug("Indexing content : "+new_anchor.Anchor_Text+" for keyword : "+new_anchor.Anchor_Type);
  var anchorTypeHash = getAnchorTypeHash(new_anchor.Anchor_Type);
  anchor_link(anchorTypeHash,new_anchorHash);
  var lnk = getLink(anchorTypeHash,"Anchor_Text",{Load:true});
  debug("Anchor created : ");
  debug(lnk);
  return lnk.Links[0].H;
}

function anchor_link(anchor_type,anchor_text)
{
  commit("anchor_links",{Links:[{Base:anchor_type,Link:anchor_text,Tag:"Anchor_Text"}]});

}

function anchor_update(updateText)
{
  var anchor_type = updateText.anchor_type;
  var old_anchorText = updateText.old_anchorText;
  var new_anchorText = updateText.new_anchorText;

  var oldAnchor={Anchor_Type:anchor_type,Anchor_Text:old_anchorText};
  var oldAnchorHash = makeHash(oldAnchor);

  var newAnchor={Anchor_Type:anchor_type,Anchor_Text:new_anchorText};
  var newAnchorHash = makeHash(newAnchor);

  var anchorTypeHash = getAnchorTypeHash(anchor_type);

  var updatedAnchor = update("anchor",newAnchor,oldAnchorHash);
  debug("Old text : "+updateText.old_anchorText+" Old hash : "+oldAnchorHash);
  debug("New text : "+updateText.new_anchorText+" New hash : "+newAnchorHash);
  debug("Anchor text successfully updated ! New anchor hash : "+updatedAnchor);

  anchor_updatelink(anchorTypeHash,oldAnchorHash,newAnchorHash);

  var updcheck = getLink(anchorTypeHash,"Anchor_Text",{Load:true});
  return updcheck;
}

function anchor_updatelink(anchorTypeHash,oldAnchorHash,newAnchorHash)
{
  commit("anchor_links",
         {Links:[
             {Base:anchorTypeHash,Link:oldAnchorHash,Tag:"Anchor_Text",LinkAction:HC.LinkAction.Del},
             {Base:anchorTypeHash,Link:newAnchorHash,Tag:"Anchor_Text"}
         ]});
}

// List all the anchor types linked to from "AnchorType" created in genesis
function anchor_type_list()
{
  var anchor_type_list=[];
  anchor_main_hash=getMainAchorHash();
  var anchor_type=doGetLinkLoad(anchor_main_hash,"Anchor_Type");

  for(var j=0;j<anchor_type.length;j++)
  {
    var temp = anchor_type[j].Anchor_Type;
    debug(temp);
    var parsed = JSON.parse(temp);
    debug(parsed.Anchor_Type);
    anchor_type_list.push(parsed.Anchor_Type);
  }

  return anchor_type_list;
}

function anchor_list(anchorType)
{
  var anchor_text_list=[];
  var anchor_hash_list=[];
  debug("Pringing anchor type :"+anchorType);
  anchor_type_hash=getAnchorTypeHash(anchorType);
  //var anchorList = getLink(anchor_type_hash,"Anchor_Text",{Load:true});

  var anchorList=doGetLinkLoad(anchor_type_hash,"Anchor_Text");
  //debug("Anchor list : ");
  //debug(anchorList);
  debug("Returning from anchor list function : ");
  debug(anchorList.length);
/*
  for(var j=0;j<anchorList.length;j++)
  {
    //debug("in for loop");
    debug("typeof anchorlist: "+typeof anchorList);
    var ser = JSON.stringify(anchorList);
    debug("typeof Serialized object : "+typeof ser);
    var temp = anchorList[j].Anchor_Text;
    debug("typeof temp : "+typeof temp)
    // var parsed = JSON.parse(temp);
    //debug(parsed.Anchor_Text);
    /*if(j!=0)
    var toPush = "AT_"+parsed.Anchor_Text;
    else {
      var toPush = parsed.Anchor_Text;
    }
    //debug(toPush);
    //anchor_text_list.push(parsed.Anchor_Text);
    anchor_text_list.push(temp)
  }*/

var ser = JSON.stringify(anchorList);
  /*for(var j=0;j<anchorList.Links.length;j++)
  {
    debug("Inside for");
    var temp = anchorList.Links[j].E;
    var contentHash = anchorList.Links[j].H;

    var begin = temp.indexOf('Anchor_Text');
    var end = temp.indexOf('Anchor_Type');

    var sub = temp.substr(begin+14,end-19);
    debug("Extracted anchor text  :"+sub);
    anchor_text_list.push(sub);
    anchor_hash_list.push(contentHash);

  }*/
  //debug(anchor_text_list.length);
  return ser;
}
/*****
*****/
// helper function to do getLink call, handle the no-link error case, and copy the returned entry values into a nicer array
function doGetLinkLoad(base, tag) {
    // get the tag from the base in the DHT
    var links = getLink(base, tag,{Load:true});
    if (isErr(links)) {
        links = [];
    } else {
        links = links.Links;
    }
    var links_filled = [];
    for (var i=0;i <links.length;i++) {
        var link = {H:links[i].H};
        link[tag] = links[i].E;
        links_filled.push(link);
    }
    debug("Links Filled:"+JSON.stringify(links_filled));
    return links_filled;
}
// helper function to determine if value returned from holochain function is an error
function isErr(result) {
    return ((typeof result === 'object') && result.name == "HolochainError");
}
function validatePut(entry_type,entry,header,pkg,sources) {
    return validate(entry_type,entry,header,sources);
}
function validateCommit(entry_type,entry,header,pkg,sources) {
    return validate(entry_type,entry,header,sources);
}
// Local validate an entry before committing ???
function validate(entry_type,entry,header,sources) {
//debug("entry_type::"+entry_type+"entry"+entry+"header"+header+"sources"+sources);
    if (entry_type == "anchor_links"||entry_type == "anchor") {
      return true;
    }
    return true
}

function validateLink(linkingEntryType,baseHash,linkHash,tag,pkg,sources){
    // this can only be "room_message_link" type which is linking from room to message
//debug("LinkingEntry_type:"+linkingEntryType+" baseHash:"+baseHash+" linkHash:"+linkHash+" tag:"+tag+" pkg:"+pkg+" sources:"+sources);
if(linkingEntryType=="anchor_links")
return true;


return true;
}
function validateMod(entry_type,hash,newHash,pkg,sources) {return false;}
function validateDel(entry_type,hash,pkg,sources) {return false;}
function validatePutPkg(entry_type) {return null}
function validateModPkg(entry_type) { return null}
function validateDelPkg(entry_type) { return null}
function validateLinkPkg(entry_type) { return null}

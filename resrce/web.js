//


window.onload = function () {
  // style infromation 
  const styleInfo = {
    normalColor : "#000000",
    selectColor : "#ff5c54",
    normal : { 
       select : ["class","icn"],
      unselect : ["class","icn_gr"],
    },
    select : { 
      select : ["class","icn"],
      unselect : ["class","icn_gr"],
    }
  } 
  // tab informaiotn 
  const tabInfo = [{
    id: "helpTAB",
    content: "helpCONTENT",
    selected: false,
    icon : "img/help.svg",
    select : ["class","icn"],
    unselect : ["class","icn_gr"],
  },{
    id: "infoTAB",
    content: "infoCONTENT",
    selected: false,
    icon : "img/info.svg",
    select : ["class","icn"],
    unselect : ["class","icn_gr"],
  },{
    id: "settingTAB",
    content: "settingCONTENT",
    selected: false,
    icon : "img/setting.svg",
    select : ["class","icn"],
    unselect : ["class","icn_gr"],
  }];

  const updateTabs = function () {
    // iterate thoughout 
    for (var i = 0; i < tabInfo.length; i++) {
      let cntnt = document.getElementById(tabInfo[i].content)
      let taskElement = document.getElementById(tabInfo[i].id)
      let icon = tabInfo[i].icon
      // do based on seleciont 
      if (tabInfo[i].selected) {
        // set content visible 
        cntnt.setAttribute("class", "content")
        // modify 
        icon.setAttribute("class","sicn")
        tabInfo[i].select = ["class","sicn"]
        tabInfo[i].unselect = ["class","sicn_gr"]
      } else {
        // set content invisible 
        cntnt.setAttribute("class", "Lcontent")
        //
        icon.setAttribute("class","icn")
        tabInfo[i].select = ["class","icn"]
        tabInfo[i].unselect = ["class","icn_gr"]
      }
    }
  }

  // tab selector 
  const selectTab = function (e) {
    for (var i = 0; i < tabInfo.length; i++) {tabInfo[i].selected = (i == e)}
    // callupdate.
    updateTabs()
    //
    let underline = document.getElementById("SelctBAR")
    //
    underline.setAttribute("class","underlinePOS" + e)
  }
  // selectTabConstructor
  const newTabSelector = function(g) {return function() {selectTab(g)}}
  // make callbacks
  for (var i = 0; i < tabInfo.length; i++) {
    let icon        = document.createElement("img") 
    //
    icon.setAttribute("class","icn")
    icon.setAttribute("src",tabInfo[i].icon)
    //
    let taskElement = document.getElementById(tabInfo[i].id)
    // save icon for later 
    tabInfo[i].icon = icon 
    // add to 
    taskElement.prepend(icon)
    // attach callbacks 
    taskElement.onmousedown = newTabSelector(i)
    taskElement.onmouseenter = (function(i){return function(){
      icon.setAttribute(tabInfo[i].unselect[0],tabInfo[i].unselect[1])
    }})(i)
    taskElement.onmouseleave = (function(i){return function(){
      icon.setAttribute(tabInfo[i].select[0],tabInfo[i].select[1])
    }})(i)
  }
  selectTab(0)
 
  //manuals
  let donateButton = document.getElementById("donateButton");

  
  donateButton.onmouseout = function() {
    if (donateButton.class != "l_trigbut"){donateButton.setAttribute("class","l_trigbut")}
  }
  donateButton.onmousedown = function() {
    donateButton.setAttribute("class","l_trigbut2")
  }

  const tglInfo = [
    {
      id : "tgl1",
      bool : false,
      boolChange : function(bool) {
        console.log(bool)
      }
    }
  ]


  for(var i=0;i < tglInfo.length;i++)
  {
    let state = tglInfo[i].bool
    // get element
    let switchElement = document.getElementById(tglInfo[i].id)
    // 
    let button = document.createElement("div")
    // 
    button.setAttribute("class","b_rdot_c")
    //
    switchElement.append(button)


    if(!state){
      button.setAttribute("class","b_ldot_c")
      switchElement.setAttribute("class","b_kouter_c")
    }else{
      button.setAttribute("class","b_rdot_c")
      switchElement.setAttribute("class","b_outer_c")
    }

    let toggleFunction = (function(i,switchElement,button,state){
      return function() {
        // double escape code! 
        state = !state 
        //
        tglInfo[i].boolChange(state)
        if(!state){
          button.setAttribute("class","b_ldot_c")
          switchElement.setAttribute("class","b_kouter_c")
        }else{
          button.setAttribute("class","b_rdot_c")
          switchElement.setAttribute("class","b_outer_c")
        }
      }
    })(i,switchElement,button,state)
    // add listenrs 
    switchElement.onmousedown =toggleFunction;
  }



}
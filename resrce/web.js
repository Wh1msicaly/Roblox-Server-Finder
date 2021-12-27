//
window.onload = function () {
  const tabInfo = [];
  tabInfo.push({
    id: "helpTAB",
    content: "helpCONTENT",
    selected: false,
    state: ["img\\icn1.png", "img\\icn1b.png"]
  })
  tabInfo.push({
    id: "infoTAB",
    content: "infoCONTENT",
    selected: false,
    state: ["img\\icn2.png", "img\\icn2b.png"]
  })
  tabInfo.push({
    id: "settingTAB",
    content: "settingCONTENT",
    selected: false,
    state: ["img\\icn3.png", "img\\icn3b.png"]
  })
  const updateTabs = function () {

    for (var i = 0; i < tabInfo.length; i++) {
      let cntnt = document.getElementById(tabInfo[i].content)
      let elm = document.getElementById(tabInfo[i].id)
      let underline = document.getElementById(tabInfo[i].id+"underline")
      let icon = document.getElementById(tabInfo[i].id+"icon")
      if (tabInfo[i].selected) {
        cntnt.setAttribute("class", "content")
        underline.setAttribute("class", "underline")
        icon.src = tabInfo[i].state[1]
      } else {
        cntnt.setAttribute("class", "Lcontent")
        underline.setAttribute("class", "underline_F")
        icon.src = tabInfo[i].state[0]
      }
    }
  }

  const selectTab = function (e) {
    for (var i = 0; i < tabInfo.length; i++) {
      tabInfo[i].selected = (i == e)
    }
    updateTabs()
  }
  const newA = function(g) 
  {
    return function() 
    {
      selectTab(g)
    }
  }
  // make callbacks
  for (var i = 0; i < tabInfo.length; i++) {
    let id = tabInfo[i].id
    let cntnt = document.getElementById(tabInfo[i].content)
    let elm = document.getElementById(id)
    let underline = document.createElement("div");
    let icon = document.createElement("img");
    icon.setAttribute("class", "icn")
    icon.setAttribute("id", id+"icon")
    underline.setAttribute("class", "underline")
    underline.setAttribute("id", id+"underline")
    elm.append(underline)
    elm.append(icon)
    if (tabInfo[i].selected) {
        cntnt.setAttribute("class", "content")
        underline.setAttribute("class", "underline")
        icon.src = tabInfo[i].state[1]
      } else {
        cntnt.setAttribute("class", "Lcontent")
        underline.setAttribute("class", "underline_F")
        icon.src = tabInfo[i].state[0]
    }  
    elm.onmousedown = newA(i)
  }
  selectTab(0)

}
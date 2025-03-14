const url = $request.url;

if (!$response.body) $done({});
let obj = JSON.parse($response.body);

const urlSuffix = "/nav/query"

// 去除app初始化首页中商城按钮
if (url.includes(urlSuffix + "/app")) {
    if (obj?.data?.data?.length > 0) {
        if (Array.isArray(obj.data.data)){
            obj.data.data = obj.data.data.filter(item => item?.frameName !== "商城");
        }
        console.log(obj.data.data)
    }
} 

// app中只保留"在社区"Tab页
if (url.includes(urlSuffix + "/navigation")) {
    if (obj?.data?.data?.length > 0) {
        if (Array.isArray(obj.data.data)){
            obj.data.data = obj.data.data.filter(item => item?.frameName === "在社区")
        }
        console.log(obj.data.data)
    }
}

// 只保留首页中MiniCard和headBanner
if (url.includes("/getPageData/C4home")) {
    if (obj?.data?.components?.length > 0) {
        const orignalData = { ...obj.data };
        if (Array.isArray(orignalData.components)){
            orignalData.components = orignalData.components.filter(item => item?.componentType === "MiniCard" || item?.componentType === "headBanner");
        }

        obj.data = {
            ...obj.data,
            components: orignalData.components
        };
    }
    console.log(obj.data)
}

// 删除服务中“生活助手栏”
if (url.includes("/pageServiceCardByGroupCode")) {
    if (obj?.data?.serviceCardDtoList) {
        obj.data.serviceCardDtoList = obj.data.serviceCardDtoList.map(card => {
          // 处理每个卡片中的 serviceModuleDtoList
          if (card.serviceModuleDtoList && Array.isArray(card.serviceModuleDtoList)) {
            card.serviceModuleDtoList = card.serviceModuleDtoList.filter(module => 
              module.name !== "生活助手"
            );
          }
          return card;
        });
    }
    console.log(obj.data)
}

// 删除会员页面中“花珑珠”和“公益”，“订单”，“收藏”，“我的卡”
if (url.includes("/pageConfig")) {
    if (obj?.data?.components?.length > 0) {
        const orignalData = { ...obj.data };
        if (Array.isArray(orignalData.components)){
            orignalData.components = orignalData.components.filter(item => item?.componentType !== "expendLongZhu" && item?.componentType !== "Banner");
        }

        const block_title = ["我的订单", "我的收藏", "我的卡", "意见反馈"];
        function filterComponents(data) {
            if (!Array.isArray(data)) return data;
            
            return data
              .filter(item => !BLACKLIST_TITLES.includes(item?.title))
              .map(item => ({
                ...item,
                children: item.children ? filterComponents(item.children) : null
              }));
        }

        orignalData.components = orignalData.components.map(component => {
          if (component.componentType === "toolsEntry" && component.children) {
                return {
                  ...component,
                  children: filterComponents(component.children)
                };
            }
            return component;
        });
        
        obj.data = {
            ...obj.data,
            components: orignalData.components
        };
    }
    console.log(obj.data)
}


$done({ body: JSON.stringify(obj) });

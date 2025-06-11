import { ElMessage } from "element-plus";
export function getMapData(code: number) {
  return new Promise((resolve, reject) => {
    // 420000
    fetch(`https://geo.datav.aliyun.com/areas_v3/bound/${code}_full.json`)
      .then((response) => response.json())
      .then((data) => {
        // 处理获取到的JSON数据
        resolve(data);
      })
      .catch((error) => {
        ElMessage.error("无法获取当前地图数据");
        reject(error);
      });
  });
}

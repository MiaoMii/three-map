<template>
  <div id="markBox" style="display: none">
    <div class="markBox">
      <div>
        名称：
        <span style="color: yellow" id="markBox-name"></span>
      </div>
      <div>
        描述：
        <span style="color: yellow" id="markBox-content"></span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup></script>

<style lang="scss" scoped>
  .markBox {
    display: none;
    position: absolute;
    background-image: url("../assets/images/card/infoCard.png");
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    padding: 10px;
    width: 229px;
    height: 185px;
    // height: 80px;
    z-index: 1;
    font-size: 12px;
    color: #fff;
    display: block;

    // justify-content: center;
    box-sizing: border-box;
    padding: 20px;
    line-height: 20px;
    // padding-bottom: 60px;
  }
</style>

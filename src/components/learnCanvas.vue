<script setup lang="ts">
import {computed, nextTick, ref} from 'vue'
const canvas = ref<null | any>(null)
nextTick(() => {
  if(canvas.value){
    const ctx = canvas.value.getContext('2d')
    ctx.beginPath();
    ctx.fillStyle = "green";
    ctx.fillRect(10, 10, 150, 100);
    ctx.closePath();

    ctx.beginPath();
    ctx.strock = "red";
    ctx.strokeRect(100, 100, 150, 100);
    ctx.closePath();

    // ctx.clearRect(0, 0, 1000, 1000);

  }
})
</script>

<template>
  <!--  <div>{{ count }}</div>-->
  <!--  <div>{{ documentCount }}</div>-->
  <!--  <button @click="count++">Increment</button>-->
  <canvas ref="canvas" width="800" height="600"></canvas>
</template>


<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>

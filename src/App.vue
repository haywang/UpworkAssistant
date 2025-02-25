<script setup lang="ts">
// import HelloWorld from './components/HelloWorld.vue'
// console.warn('pop page')

console.warn(document.querySelector('.air3-badge-tagline'))
// 获取第一个匹配的 DOM 元素
const badgeElement = document.querySelector('.air3-badge-tagline strong');

// 提取金额
if (badgeElement) {
  const amountText = badgeElement.textContent;
  let amount = 0
  if (amountText) {
    amount = parseInt(amountText.replace(/[^0-9]/g, ''), 10);
  }

  console.log('提取的金额:', amount);
} else {
  console.log('未找到匹配的元素');
}
</script>

<template>
  <!-- <div>
    <a href="https://vite.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
  </div> -->
    <h1 class="text-3xl font-bold underline">
    Hello world!
  </h1>
  <!-- <HelloWorld msg="Vite + Vue" /> -->
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

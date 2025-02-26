<template>
  <div>
    <h2 class="text-center">
      Welcome to your
      <a href="https://www.plasmo.com" target="_blank">Plasmo</a> Extension!
    </h2>

    <div class="container">
      <button @click="decrement">-</button>
      <p>
        <b>{{ state.count }}</b>
      </p>
      <button @click="increment">+</button>
    </div>
  </div>
  <p v-if="state.action" class="action text-center">
    {{ state.action }}
  </p>
  <a href="https://docs.plasmo.com" target="_blank"> View Docs </a>
  <!-- <button
    type="button"
    class="flex flex-row items-center px-4 py-2 text-sm rounded-lg transition-all border-none shadow-lg hover:shadow-md active:scale-105 bg-slate-50 hover:bg-red-600">
    Count:
    <span
      class="inline-flex items-center justify-center w-8 h-4 ml-2 text-xs font-semibold rounded-full">
      18
    </span>
  </button> -->
  <h1 class="text-3xl font-bold underline bg-red-400">Title</h1>
</template>

<style></style>

<script setup lang="ts">
import { reactive } from "vue"
import type { App } from "vue"

import "./styles.css"

const state = reactive({ count: 0, action: null })

function increment() {
  state.count++
  state.action = "increment"
}

function decrement() {
  state.count--
  state.action = "decrement"
}

defineOptions({
  prepare(app: App) {
    // Use any plugins here:
    // app.use
  }
})
</script>

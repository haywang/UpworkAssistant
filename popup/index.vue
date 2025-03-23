<!-- popup/index.vue -->
<template>
  <div class="popup-container">
    <h2>Upwork Assistant</h2>

    <div class="language-selector">
      <label>Language / 语言</label>
      <select v-model="language" @change="handleLanguageChange">
        <option value="zh">中文</option>
        <option value="en">English</option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Storage } from "@plasmohq/storage"

const storage = new Storage()
// default is en
const language = ref('en')

onMounted(async () => {
  // 获取保存的语言设置
  const savedLanguage = await storage.get('upwork-language')
  language.value = savedLanguage || 'en'
})

const handleLanguageChange = async () => {
  // 保存语言设置
  await storage.set('upwork-language', language.value)
}
</script>

<style>
.popup-container {
  padding: 16px;
  width: 200px;
}

h2 {
  margin: 0 0 12px 0;
  font-size: 18px;
}

.language-selector {
  margin-bottom: 16px;
}

.language-selector label {
  display: block;
  margin-bottom: 8px;
}

.language-selector select {
  width: 100%;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #ddd;
}
</style>
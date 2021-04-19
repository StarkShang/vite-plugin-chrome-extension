<template>
    <div v-show="visible" class="ce-mask">
        <div class="ce-popup">
            <div class="ce-popup-content">
                Hello, Vite-Plugin-Chrome-Extension
            </div>
        </div>
    </div>
</template>

<script>
import { defineComponent } from "vue";
export default defineComponent({
    data: () => ({ visible: false }),
});
</script>

<style scoped>
.ce-mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0,0,0,.6);
    z-index: 99999;
}
.ce-popup {
    position: absolute;
    top: 20px;
    right: 20px;
    padding: 1.5rem;
    border-radius: 8px;
    background-color: rgba(255, 255, 255, 0.95);
    box-shadow: 0 1px 10px 0 rgb(0 0 0 / 50%);
}
.ce-popup-content {
    font-size: 1.5em;
    font-weight: 700;
    color: deepskyblue;
}
</style>

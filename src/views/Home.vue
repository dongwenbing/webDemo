<template>
    <div class="home">
        <img alt="Vue logo" src="../assets/logo.png">
        <HelloWorld msg="Welcome to Your Vue.js App" />
    </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue'

export default {
    name: 'Home',
    components: {
        HelloWorld
    },
    created() {
        let a = ''

    },
    methods: {

    }
}
</script>
<style lang="scss" scoped>
.page-box {
    .top-box {
        width: 100%;
    }
    .center-box {
        color: red;
    }
    .buttom-box {
        font-size: 0.2rem;
    }
}
</style>

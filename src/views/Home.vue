<template>
  <v-row no-gutters>
    <v-col>
      <v-card width="100%">
        <v-card-text>
          <div class="home">
            <div>
              <h1>Hello world</h1>
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-btn to="/about">
            About
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: "Home"
};
</script>

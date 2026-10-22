plugins {
    kotlin("jvm") version "1.9.22"
    `maven-publish`
}

group = "dev.labmu.cmsmu"
version = "1.0.0"

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.8.0")
    testImplementation(kotlin("test"))
}

kotlin {
    jvmToolchain(17)
}

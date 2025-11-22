import java.util.Properties
import java.io.FileInputStream

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("rust")
}

val tauriProperties = Properties().apply {
    val propFile = file("tauri.properties")
    if (propFile.exists()) {
        propFile.inputStream().use { load(it) }
    }
}

android {
    namespace = "com.ik9014.storerader"
    compileSdk = 36

    defaultConfig {
        applicationId = "com.ik9014.storerader"
        minSdk = 24
        targetSdk = 36
        versionCode = tauriProperties.getProperty("tauri.android.versionCode", "1").toInt()
        versionName = tauriProperties.getProperty("tauri.android.versionName", "1.0")
        manifestPlaceholders["usesCleartextTraffic"] = "false"
    }

    // keystore.properties 로드 (필수)
    val keystorePropertiesFile = rootProject.file("keystore.properties")
    val keystoreProperties = Properties()
    if (!keystorePropertiesFile.exists()) {
        throw GradleException("keystore.properties 가 없습니다: ${keystorePropertiesFile.absolutePath}")
    } else {
        keystoreProperties.load(FileInputStream(keystorePropertiesFile))
    }

    signingConfigs {
        create("common") {
            keyAlias = keystoreProperties["keyAlias"] as String
            keyPassword = keystoreProperties["password"] as String
            storeFile = file(keystoreProperties["storeFile"] as String)
            storePassword = keystoreProperties["password"] as String
        }
    }

    buildTypes {
        getByName("debug") {
            // debug도 release와 동일 keystore 사용
            signingConfig = signingConfigs.getByName("common")
            isDebuggable = true
            isJniDebuggable = true
            isMinifyEnabled = false
            manifestPlaceholders["usesCleartextTraffic"] = "true"
        }

        getByName("release") {
            signingConfig = signingConfigs.getByName("common")
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    // packaging 은 buildTypes 안이 아니라 android 블록 바로 아래 (전역)
    packaging {
        jniLibs {
            // Tauri가 생성하는 각 아키텍처 so 심볼 유지 (디버깅 편의)
            keepDebugSymbols += listOf(
                "*/arm64-v8a/*.so",
                "*/armeabi-v7a/*.so",
                "*/x86/*.so",
                "*/x86_64/*.so"
            )
        }
    }

    // JDK 17로 명시 (Kotlin의 JDK 24 fallback 경고 제거)
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        buildConfig = true
    }
}

rust {
    rootDirRel = "../../../"
}

dependencies {
    implementation("androidx.webkit:webkit:1.14.0")
    implementation("androidx.appcompat:appcompat:1.7.1")
    implementation("androidx.activity:activity-ktx:1.10.1")
    implementation("com.google.android.material:material:1.12.0")
    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.1.4")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.5.0")
}

apply(from = "tauri.build.gradle.kts")

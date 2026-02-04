# Batch Icon Generator - Blockbench Plugin

> **Language / 언어**:&nbsp;&nbsp; [한국어](#한국어) &nbsp;|&nbsp; [English](#english)

---

## 한국어

### 소개
`.geo.json` 베드락 에디션 모델 파일에 텍스처를 자동으로 매칭하여, 정사영(Orthographic) 아이콘 이미지를 일괄 생성하는 Blockbench 데스크톱 플러그인입니다.

### 주요 기능
- **일괄 처리**: 폴더 내 모든 `.geo.json` 모델을 한 번에 처리
- **텍스처 자동 매칭**: 모델명 기반으로 텍스처를 자동 탐지
  - 직접 파일 (`모델명.png`)
  - 하위 폴더 (`모델명/*.png`)
  - 번호 변형 (`모델명2.png`, `모델명3.png`, ...)
- **투명 배경**: 배경 없이 모델만 깔끔하게 캡처
- **자동 크롭**: 모델 영역만 잘라내어 아이콘에 꽉 차게 출력
- **item_texture.json 자동 등록**: 생성된 아이콘을 `item_texture.json`에 자동 추가 (기존 항목은 건너뜀, 파일 없으면 새로 생성)
- **다국어 지원**: 한국어 / 영어 UI 자동 전환 (Blockbench 언어 설정 기반)
- **카메라 프리셋**: 정사영 우측/좌측, 위, 정면, 우측면 선택 가능
- **크기 설정**: 16px ~ 256px 사이에서 아이콘 크기 지정 (기본 32x32)

### 설치 방법
1. `batch_icon_generator.js` 파일을 다운로드합니다.
2. Blockbench를 실행합니다.
3. **File** > **Plugins** > 상단의 아이콘 중 **Load Plugin from File** 클릭
4. 다운로드한 `batch_icon_generator.js` 파일을 선택합니다.

### 사용 방법
1. 상단 메뉴 **Filter** > **모델 아이콘 일괄 생성** 클릭
2. **모델 폴더**: `.geo.json` 파일이 있는 폴더 선택 (예: `models/entity`)
3. **텍스처 폴더** (선택): 비워두면 `모델폴더/../../textures/blocks` 에서 자동 탐지
4. **출력 폴더** (선택): 비워두면 `모델폴더/../../textures/items` 에 저장
5. **카메라 각도**, **아이콘 크기** 설정 후 확인 클릭
6. 완료 시 생성 결과와 `item_texture.json` 등록 현황이 표시됩니다.

### 폴더 구조 예시
```
MyResourcePack/
├── models/
│   └── entity/
│       ├── chair.geo.json      ← 모델 폴더 선택
│       ├── table.geo.json
│       └── lamp.geo.json
├── textures/
│   ├── blocks/
│   │   ├── chair.png           ← 자동 매칭
│   │   ├── table/              ← 하위 폴더 변형
│   │   │   ├── table_oak.png
│   │   │   └── table_birch.png
│   │   ├── lamp.png
│   │   ├── lamp2.png           ← 번호 변형
│   │   └── lamp3.png
│   ├── items/                  ← 아이콘 출력 위치
│   │   ├── chair.icon.png
│   │   ├── table_oak.icon.png
│   │   ├── table_birch.icon.png
│   │   ├── lamp.icon.png
│   │   ├── lamp2.icon.png
│   │   └── lamp3.icon.png
│   └── item_texture.json      ← 자동 등록
```

---

## English

### About
A Blockbench desktop plugin that batch generates orthographic icon images from Bedrock Edition `.geo.json` model files with automatic texture matching.

### Features
- **Batch Processing**: Process all `.geo.json` models in a folder at once
- **Auto Texture Matching**: Automatically detect textures based on model name
  - Direct file (`modelname.png`)
  - Subfolder (`modelname/*.png`)
  - Numbered variants (`modelname2.png`, `modelname3.png`, ...)
- **Transparent Background**: Clean capture with no background
- **Auto Crop**: Crop to model bounds and fill the icon frame
- **item_texture.json Auto-Registration**: Automatically add generated icons to `item_texture.json` (skips existing entries, creates file if missing)
- **Localization**: Korean / English UI auto-switch based on Blockbench language settings
- **Camera Presets**: Isometric right/left, top, front, right side
- **Size Options**: Icon size from 16px to 256px (default 32x32)

### Installation
1. Download `batch_icon_generator.js`.
2. Open Blockbench.
3. Go to **File** > **Plugins** > click the **Load Plugin from File** icon at the top.
4. Select the downloaded `batch_icon_generator.js` file.

### Usage
1. Go to **Filter** > **Batch Generate Model Icons** in the menu bar.
2. **Models Folder**: Select the folder containing `.geo.json` files (e.g., `models/entity`).
3. **Textures Folder** (optional): Leave empty to auto-detect from `models/../../textures/blocks`.
4. **Output Folder** (optional): Leave empty to save to `models/../../textures/items`.
5. Set **Camera Angle** and **Icon Size**, then click confirm.
6. On completion, a summary of generated icons and `item_texture.json` registration status will be shown.

### Folder Structure Example
```
MyResourcePack/
├── models/
│   └── entity/
│       ├── chair.geo.json      ← Select this folder
│       ├── table.geo.json
│       └── lamp.geo.json
├── textures/
│   ├── blocks/
│   │   ├── chair.png           ← Auto matched
│   │   ├── table/              ← Subfolder variants
│   │   │   ├── table_oak.png
│   │   │   └── table_birch.png
│   │   ├── lamp.png
│   │   ├── lamp2.png           ← Numbered variants
│   │   └── lamp3.png
│   ├── items/                  ← Icon output location
│   │   ├── chair.icon.png
│   │   ├── table_oak.icon.png
│   │   ├── table_birch.icon.png
│   │   ├── lamp.icon.png
│   │   ├── lamp2.icon.png
│   │   └── lamp3.icon.png
│   └── item_texture.json      ← Auto registered
```

---

## License

This project is licensed under the **GNU General Public License v3.0**.

See [LICENSE](LICENSE) for details.

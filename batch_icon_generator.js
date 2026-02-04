/**
 * Batch Icon Generator - Blockbench Plugin
 * Copyright (C) 2025 Pixel Creator's Place
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */
(function() {

let generateAction;
const fs = require('fs');
const path = require('path');

// ── Localization ──

const LANG = {
    en: {
        plugin_title: 'Batch Icon Generator',
        plugin_desc: 'Batch generate orthographic icon images from .geo.json models with textures applied. Supports texture variants (subfolder, numbered), auto-crop, transparent background, and automatic item_texture.json registration.',
        action_name: 'Batch Generate Model Icons',
        action_desc: 'Generate orthographic icons from all .geo.json models in a folder with auto texture matching',
        dialog_title: 'Batch Icon Generator',
        label_models: 'Models Folder',
        label_textures: 'Textures Folder (optional)',
        label_output: 'Output Folder (optional)',
        label_info: 'Info',
        info_text: 'Leave Textures/Output folders empty for auto-detection.\nTextures: [models folder]/../../textures/blocks\nOutput: [models folder]/../../textures/items',
        label_camera: 'Camera Angle',
        cam_iso_right: 'Isometric Right',
        cam_iso_left: 'Isometric Left',
        cam_top: 'Top',
        cam_south: 'South (Front)',
        cam_east: 'East (Right)',
        label_size: 'Icon Size (px)',
        msg_no_folder: 'Please select a models folder',
        msg_no_models: 'No .geo.json files found',
        msg_found: (icons, models) => `Found ${icons} icons from ${models} models. Processing...`,
        msg_status: (cur, total) => `Icons: ${cur}/${total}`,
        msg_done_title: 'Icon Generation Complete',
        msg_done: (ok, total) => `Generated ${ok}/${total} icons`,
        msg_item_tex: (added, skipped) => `item_texture.json: ${added} added, ${skipped} already existed`,
        msg_errors: (n) => `${n} errors:`,
        msg_more: (n) => `... and ${n} more`,
        msg_fail_title: 'Error',
        msg_fail: (e) => 'Failed: ' + e,
        status_complete: (ok, total) => `Icon generation complete: ${ok}/${total}`
    },
    ko: {
        plugin_title: 'Batch Icon Generator',
        plugin_desc: '.geo.json 모델에 텍스처를 적용하여 정사영 아이콘 이미지를 일괄 생성합니다. 텍스처 변형(하위 폴더, 번호), 자동 크롭, 투명 배경, item_texture.json 자동 등록을 지원합니다.',
        action_name: '모델 아이콘 일괄 생성',
        action_desc: '폴더 내 모든 .geo.json 모델에서 텍스처를 자동 매칭하여 정사영 아이콘을 생성합니다',
        dialog_title: '아이콘 일괄 생성',
        label_models: '모델 폴더',
        label_textures: '텍스처 폴더 (선택)',
        label_output: '출력 폴더 (선택)',
        label_info: '안내',
        info_text: '텍스처/출력 폴더를 비워두면 자동으로 감지합니다.\n텍스처: [모델 폴더]/../../textures/blocks\n출력: [모델 폴더]/../../textures/items',
        label_camera: '카메라 각도',
        cam_iso_right: '정사영 우측',
        cam_iso_left: '정사영 좌측',
        cam_top: '위',
        cam_south: '남쪽 (정면)',
        cam_east: '동쪽 (우측면)',
        label_size: '아이콘 크기 (px)',
        msg_no_folder: '모델 폴더를 선택해주세요',
        msg_no_models: '.geo.json 파일을 찾을 수 없습니다',
        msg_found: (icons, models) => `모델 ${models}개에서 아이콘 ${icons}개 발견. 처리 중...`,
        msg_status: (cur, total) => `아이콘: ${cur}/${total}`,
        msg_done_title: '아이콘 생성 완료',
        msg_done: (ok, total) => `${total}개 중 ${ok}개 아이콘 생성 완료`,
        msg_item_tex: (added, skipped) => `item_texture.json: ${added}개 추가, ${skipped}개 이미 존재`,
        msg_errors: (n) => `${n}개 오류:`,
        msg_more: (n) => `... 외 ${n}개`,
        msg_fail_title: '오류',
        msg_fail: (e) => '처리 실패: ' + e,
        status_complete: (ok, total) => `아이콘 생성 완료: ${ok}/${total}`
    }
};

function getLang() {
    try {
        let code = settings.language.value || 'en';
        if (code.startsWith('ko')) return 'ko';
    } catch (e) {}
    return 'en';
}

function t(key) {
    let lang = getLang();
    return (LANG[lang] && LANG[lang][key]) || LANG.en[key] || key;
}

// ── Plugin ──

Plugin.register('batch_icon_generator', {
    title: 'Batch Icon Generator',
    author: "Pixel Creator's Place",
    icon: 'photo_camera',
    description: 'Batch generate orthographic icon images from .geo.json models with textures. Supports texture variants, auto-crop, transparent background, and item_texture.json auto-registration.',
    version: '1.2.0',
    variant: 'desktop',
    min_version: '4.0.0',

    onload() {
        generateAction = new Action('batch_generate_model_icons', {
            name: t('action_name'),
            description: t('action_desc'),
            icon: 'photo_camera',
            click: function() {
                showConfigDialog();
            }
        });
        MenuBar.addAction(generateAction, 'filter');
    },

    onunload() {
        generateAction.delete();
    }
});

// ── Dialog ──

function showConfigDialog() {
    let dialog = new Dialog({
        id: 'icon_generator_config',
        title: t('dialog_title'),
        width: 600,
        form: {
            models_folder: {
                label: t('label_models'),
                type: 'folder',
                value: ''
            },
            textures_folder: {
                label: t('label_textures'),
                type: 'folder',
                value: ''
            },
            output_folder: {
                label: t('label_output'),
                type: 'folder',
                value: ''
            },
            info: {
                label: t('label_info'),
                type: 'info',
                text: t('info_text')
            },
            camera_preset: {
                label: t('label_camera'),
                type: 'select',
                options: {
                    isometric_right: t('cam_iso_right'),
                    isometric_left: t('cam_iso_left'),
                    top: t('cam_top'),
                    south: t('cam_south'),
                    east: t('cam_east')
                },
                value: 'isometric_right'
            },
            icon_size: {
                label: t('label_size'),
                type: 'number',
                value: 32,
                min: 16,
                max: 256
            }
        },
        onConfirm: function(formData) {
            dialog.hide();
            processModels(formData);
        }
    });
    dialog.show();
}

// ── Utils ──

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ── Main Process ──

async function processModels(config) {
    try {
        let modelsPath = config.models_folder;
        if (!modelsPath) {
            Blockbench.showQuickMessage(t('msg_no_folder'), 2000);
            return;
        }

        modelsPath = modelsPath.replace(/^file:\/\//, '');

        if (fs.existsSync(modelsPath)) {
            let stat = fs.statSync(modelsPath);
            if (stat.isFile()) {
                modelsPath = path.dirname(modelsPath);
            }
        }

        let modelFiles = fs.readdirSync(modelsPath).filter(f => f.endsWith('.geo.json'));

        if (modelFiles.length === 0) {
            Blockbench.showQuickMessage(t('msg_no_models'), 2000);
            return;
        }

        // models/entity -> models -> pack root
        let packRoot = path.dirname(path.dirname(modelsPath));
        let texturesFolder = config.textures_folder || path.join(packRoot, 'textures', 'blocks');
        let outputFolder = config.output_folder || path.join(packRoot, 'textures', 'items');
        let cameraPresetId = config.camera_preset || 'isometric_right';
        let iconSize = config.icon_size || 32;

        // DefaultCameraPresets is an ARRAY - must find by id
        let cameraPreset = null;
        if (typeof DefaultCameraPresets !== 'undefined' && Array.isArray(DefaultCameraPresets)) {
            cameraPreset = DefaultCameraPresets.find(p => p.id === cameraPresetId);
        }

        // Build model groups: load each model ONCE, process all its texture variants
        let modelGroups = [];
        let totalJobs = 0;
        for (let modelFile of modelFiles) {
            let modelName = path.basename(modelFile, '.geo.json');
            let modelPath = path.join(modelsPath, modelFile);
            let textures = findTextureVariants(modelName, texturesFolder);
            modelGroups.push({ modelName, modelPath, textures });
            totalJobs += textures.length;
        }

        Blockbench.showQuickMessage(t('msg_found')(totalJobs, modelFiles.length), 3000);

        // Ensure output folder exists
        if (!fs.existsSync(outputFolder)) {
            fs.mkdirSync(outputFolder, { recursive: true });
        }

        let processed = 0;
        let errors = [];
        let generatedNames = [];

        for (let group of modelGroups) {
            try {
                // Load model ONCE per group
                newProject(Formats.bedrock);

                let modelContent = fs.readFileSync(group.modelPath, 'utf8');
                let modelData = JSON.parse(modelContent);
                Codecs.bedrock.parse(modelData, group.modelPath);

                // Set orthographic camera
                Preview.selected.setProjectionMode(true);
                if (cameraPreset) {
                    Preview.selected.loadAnglePreset(cameraPreset);
                }

                Canvas.updateAll();
                await delay(200);

                // Process each texture variant by swapping textures (no re-parse needed)
                for (let tex of group.textures) {
                    try {
                        // Remove all existing textures
                        Texture.all.slice().forEach(t => t.remove());

                        // Load the variant texture
                        if (tex.path && fs.existsSync(tex.path)) {
                            new Texture().fromPath(tex.path).add(false);
                        }

                        Canvas.updateAll();
                        await delay(100);

                        // Capture icon with transparent background + auto-crop
                        await captureIcon(outputFolder, tex.outputName, iconSize);

                        processed++;
                        generatedNames.push(tex.outputName);
                        Blockbench.setStatusBarText(t('msg_status')(processed, totalJobs));
                    } catch (error) {
                        errors.push({ file: tex.outputName, error: error.message });
                    }
                }
            } catch (error) {
                for (let tex of group.textures) {
                    errors.push({ file: tex.outputName, error: 'Model load: ' + error.message });
                }
            }
        }

        // item_texture.json auto-registration
        let itemTexResult = updateItemTextureJson(packRoot, generatedNames);

        // Results
        let message = t('msg_done')(processed, totalJobs);
        message += '\n\n' + t('msg_item_tex')(itemTexResult.added, itemTexResult.skipped);
        if (errors.length > 0) {
            message += '\n\n' + t('msg_errors')(errors.length);
            let shown = errors.slice(0, 20);
            for (let e of shown) {
                message += `\n  - ${e.file}: ${e.error}`;
            }
            if (errors.length > 20) {
                message += '\n  ' + t('msg_more')(errors.length - 20);
            }
        }

        Blockbench.showMessageBox({
            title: t('msg_done_title'),
            message: message,
            icon: processed > 0 ? 'check_circle' : 'error'
        });
        Blockbench.setStatusBarText(t('status_complete')(processed, totalJobs));

    } catch (error) {
        Blockbench.showMessageBox({
            title: t('msg_fail_title'),
            message: t('msg_fail')(error.message),
            icon: 'error'
        });
    }
}

// ── Capture ──

function captureIcon(outputFolder, outputName, iconSize) {
    return new Promise((resolve, reject) => {
        try {
            let dataUrl;

            Canvas.withoutGizmos(() => {
                let renderer = Preview.selected.renderer;
                let sceneObj = Preview.selected.scene;
                let oldBg = sceneObj ? sceneObj.background : null;

                if (sceneObj) sceneObj.background = null;
                renderer.setClearColor(0x000000, 0);

                Preview.selected.render();
                dataUrl = Preview.selected.canvas.toDataURL('image/png');

                if (sceneObj) sceneObj.background = oldBg;
            });

            if (!dataUrl) {
                reject(new Error('Failed to capture canvas'));
                return;
            }

            let img = new Image();
            img.onload = () => {
                try {
                    let tempCanvas = document.createElement('canvas');
                    tempCanvas.width = img.width;
                    tempCanvas.height = img.height;
                    let tempCtx = tempCanvas.getContext('2d');
                    tempCtx.drawImage(img, 0, 0);

                    let imageData = tempCtx.getImageData(0, 0, img.width, img.height);
                    let bounds = findContentBounds(imageData.data, img.width, img.height);

                    if (!bounds) {
                        let emptyCanvas = document.createElement('canvas');
                        emptyCanvas.width = iconSize;
                        emptyCanvas.height = iconSize;
                        saveCanvasToFile(emptyCanvas, outputFolder, outputName);
                        resolve();
                        return;
                    }

                    // Add padding (8%)
                    let maxDim = Math.max(bounds.w, bounds.h);
                    let pad = Math.max(2, Math.floor(maxDim * 0.08));

                    let cx = Math.max(0, bounds.x - pad);
                    let cy = Math.max(0, bounds.y - pad);
                    let cw = Math.min(img.width - cx, bounds.w + pad * 2);
                    let ch = Math.min(img.height - cy, bounds.h + pad * 2);

                    // Extract cropped content
                    let cropCanvas = document.createElement('canvas');
                    cropCanvas.width = cw;
                    cropCanvas.height = ch;
                    let cropCtx = cropCanvas.getContext('2d');
                    cropCtx.drawImage(tempCanvas, cx, cy, cw, ch, 0, 0, cw, ch);

                    // Center in a square
                    let sq = Math.max(cw, ch);
                    let squareCanvas = document.createElement('canvas');
                    squareCanvas.width = sq;
                    squareCanvas.height = sq;
                    let sqCtx = squareCanvas.getContext('2d');
                    let offX = Math.floor((sq - cw) / 2);
                    let offY = Math.floor((sq - ch) / 2);
                    sqCtx.drawImage(cropCanvas, offX, offY);

                    // Resize to icon size (nearest-neighbor)
                    let finalCanvas = document.createElement('canvas');
                    finalCanvas.width = iconSize;
                    finalCanvas.height = iconSize;
                    let finalCtx = finalCanvas.getContext('2d');
                    finalCtx.imageSmoothingEnabled = false;
                    finalCtx.drawImage(squareCanvas, 0, 0, sq, sq, 0, 0, iconSize, iconSize);

                    saveCanvasToFile(finalCanvas, outputFolder, outputName);
                    resolve();
                } catch (e) {
                    reject(e);
                }
            };
            img.onerror = () => reject(new Error('Image decode failed'));
            img.src = dataUrl;
        } catch (error) {
            reject(error);
        }
    });
}

// ── File I/O ──

function saveCanvasToFile(canvas, outputFolder, outputName) {
    let dataUrl = canvas.toDataURL('image/png');
    let base64 = dataUrl.replace(/^data:image\/png;base64,/, '');
    let buffer = Buffer.from(base64, 'base64');
    let outputPath = path.join(outputFolder, outputName + '.icon.png');
    fs.writeFileSync(outputPath, buffer);
}

function updateItemTextureJson(packRoot, iconNames) {
    let result = { added: 0, skipped: 0 };
    if (!iconNames || iconNames.length === 0) return result;

    let jsonPath = path.join(packRoot, 'textures', 'item_texture.json');
    let data;

    if (fs.existsSync(jsonPath)) {
        try {
            let content = fs.readFileSync(jsonPath, 'utf8');
            data = JSON.parse(content);
        } catch (e) {
            data = {};
        }
    } else {
        data = {};
    }

    if (!data.texture_data) {
        data.texture_data = {};
    }

    for (let name of iconNames) {
        if (data.texture_data[name]) {
            result.skipped++;
        } else {
            data.texture_data[name] = {
                textures: 'textures/items/' + name + '.icon.png'
            };
            result.added++;
        }
    }

    // Sort keys alphabetically
    let sorted = {};
    Object.keys(data.texture_data).sort().forEach(key => {
        sorted[key] = data.texture_data[key];
    });
    data.texture_data = sorted;

    let texturesDir = path.join(packRoot, 'textures');
    if (!fs.existsSync(texturesDir)) {
        fs.mkdirSync(texturesDir, { recursive: true });
    }
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));

    return result;
}

// ── Image Analysis ──

function findContentBounds(pixels, width, height) {
    let minX = width, minY = height, maxX = 0, maxY = 0;
    let found = false;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let idx = (y * width + x) * 4;
            if (pixels[idx + 3] > 10) {
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
                found = true;
            }
        }
    }

    if (!found) return null;
    return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
}

// ── Texture Variant Detection ──

function findTextureVariants(modelName, texturesFolder) {
    let variants = [];

    // 1. Direct file (modelName.png)
    let directFile = path.join(texturesFolder, modelName + '.png');
    if (fs.existsSync(directFile)) {
        variants.push({
            path: directFile,
            variant: null,
            outputName: modelName,
            modelName: modelName
        });
    }

    // 2. Subfolder (modelName/*.png)
    let subFolder = path.join(texturesFolder, modelName);
    if (fs.existsSync(subFolder) && fs.statSync(subFolder).isDirectory()) {
        let files = fs.readdirSync(subFolder).filter(f => f.endsWith('.png')).sort();
        for (let file of files) {
            let variantName = path.basename(file, '.png');
            variants.push({
                path: path.join(subFolder, file),
                variant: variantName,
                outputName: variantName,
                modelName: modelName
            });
        }
    }

    // 3. Numbered variants (modelName2.png, modelName3.png, etc.)
    try {
        let folderFiles = fs.readdirSync(texturesFolder).filter(f => {
            if (!f.endsWith('.png')) return false;
            if (f === modelName + '.png') return false;
            let name = path.basename(f, '.png');
            return name.startsWith(modelName) && /\d+$/.test(name);
        }).sort();

        for (let file of folderFiles) {
            let variantName = path.basename(file, '.png');
            variants.push({
                path: path.join(texturesFolder, file),
                variant: variantName,
                outputName: variantName,
                modelName: modelName
            });
        }
    } catch (e) {}

    // No variants found - process without texture
    if (variants.length === 0) {
        variants.push({
            path: null,
            variant: null,
            outputName: modelName,
            modelName: modelName
        });
    }

    return variants;
}

})();

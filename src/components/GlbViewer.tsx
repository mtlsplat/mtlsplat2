import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Box, 
  Upload, 
  RotateCcw, 
  Maximize2, 
  Grid as GridIcon, 
  Eye, 
  Trash2, 
  Layers, 
  Compass, 
  Sparkles, 
  FileBox, 
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  Palette,
  X,
  EyeOff
} from 'lucide-react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export interface GlbModelItem {
  id: string;
  name: string;
  url: string;
  size?: string;
  isCustom?: boolean;
}

export interface PbrMapInfo {
  id: string;
  materialName: string;
  mapType: 'Albedo / Base Color' | 'Normal Map' | 'Roughness Map' | 'Metalness Map' | 'Emissive Map' | 'Ambient Occlusion';
  previewUrl: string | null;
  texture: THREE.Texture;
  width?: number;
  height?: number;
}

const DEFAULT_SAMPLE_MODELS: GlbModelItem[] = [
  {
    id: 'helmet',
    name: 'Damaged Helmet (PBR)',
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb',
    size: '5.8 MB'
  },
  {
    id: 'duck',
    name: 'Rubber Duck',
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb',
    size: '1.5 MB'
  },
  {
    id: 'flight-helmet',
    name: 'Flight Helmet',
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/FlightHelmet/glTF/FlightHelmet.gltf',
    size: '12.4 MB'
  }
];

export const GlbViewer: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [models, setModels] = useState<GlbModelItem[]>(DEFAULT_SAMPLE_MODELS);
  const [currentModel, setCurrentModel] = useState<GlbModelItem>(DEFAULT_SAMPLE_MODELS[0]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // Viewer options
  const [wireframe, setWireframe] = useState<boolean>(false);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showAxes, setShowAxes] = useState<boolean>(false);

  // Sidebar Tab ('models' | 'pbr')
  const [sidebarTab, setSidebarTab] = useState<'models' | 'pbr'>('models');

  // Model statistics & PBR maps
  const [stats, setStats] = useState({
    vertices: 0,
    triangles: 0,
    meshes: 0,
    materials: 0
  });
  const [pbrMaps, setPbrMaps] = useState<PbrMapInfo[]>([]);
  const [selectedTextureModal, setSelectedTextureModal] = useState<PbrMapInfo | null>(null);
  const [activeMapPreview, setActiveMapPreview] = useState<PbrMapInfo | null>(null);

  // Three.js instances ref
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const currentObjectRef = useRef<THREE.Object3D | null>(null);
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);
  const axesHelperRef = useRef<THREE.AxesHelper | null>(null);

  // Store original maps per material for restoration
  const originalMapsRef = useRef<Map<THREE.Material, THREE.Texture | null>>(new Map());

  // Initialize Three.js scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf4f4f5); // light gray brutalist bg
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(3, 2, 4);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 2.0;
    controlsRef.current = controls;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.5);
    dirLight1.position.set(5, 10, 7);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x909090, 1.5);
    dirLight2.position.set(-5, -5, -5);
    scene.add(dirLight2);

    // Grid Helper
    const gridHelper = new THREE.GridHelper(10, 10, 0x000000, 0xcccccc);
    gridHelper.position.y = -1;
    scene.add(gridHelper);
    gridHelperRef.current = gridHelper;

    // Axes Helper
    const axesHelper = new THREE.AxesHelper(2);
    axesHelper.position.y = -1.01;
    scene.add(axesHelper);
    axesHelperRef.current = axesHelper;

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    // Resize handler
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      if (rendererRef.current && rendererRef.current.domElement) {
        container.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, []);

  // Update helper visibility and auto-rotate
  useEffect(() => {
    if (gridHelperRef.current) gridHelperRef.current.visible = showGrid;
    if (axesHelperRef.current) axesHelperRef.current.visible = showAxes;
    if (controlsRef.current) controlsRef.current.autoRotate = autoRotate;
  }, [showGrid, showAxes, autoRotate]);

  // Load model when currentModel changes
  const loadModel = useCallback((item: GlbModelItem) => {
    if (!sceneRef.current || !cameraRef.current || !controlsRef.current) return;
    setIsLoading(true);
    setLoadingProgress(0);
    setError(null);
    setSelectedTextureModal(null);
    setActiveMapPreview(null);
    originalMapsRef.current.clear();

    // Remove existing object
    if (currentObjectRef.current) {
      sceneRef.current.remove(currentObjectRef.current);
      currentObjectRef.current.traverse((child) => {
        if ((child as THREE.Mesh).geometry) (child as THREE.Mesh).geometry.dispose();
        if ((child as THREE.Mesh).material) {
          const mat = (child as THREE.Mesh).material;
          if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
          else mat.dispose();
        }
      });
      currentObjectRef.current = null;
    }

    const loader = new GLTFLoader();
    loader.load(
      item.url,
      (gltf) => {
        const obj = gltf.scene;
        currentObjectRef.current = obj;

        // Compute bounding box
        const box = new THREE.Box3().setFromObject(obj);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        // Center model
        obj.position.x = -center.x;
        obj.position.y = -center.y + (size.y / 2);
        obj.position.z = -center.z;

        // Apply wireframe & collect stats & PBR maps
        let vertCount = 0;
        let triCount = 0;
        let meshCount = 0;
        const materialsSet = new Set<THREE.Material>();

        obj.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            meshCount++;
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            if (mesh.geometry) {
              const geom = mesh.geometry;
              if (geom.index) {
                triCount += geom.index.count / 3;
              } else if (geom.attributes.position) {
                triCount += geom.attributes.position.count / 3;
              }
              if (geom.attributes.position) {
                vertCount += geom.attributes.position.count;
              }
            }

            if (mesh.material) {
              if (Array.isArray(mesh.material)) {
                mesh.material.forEach((m) => {
                  (m as any).wireframe = wireframe;
                  materialsSet.add(m);
                  if (!originalMapsRef.current.has(m)) {
                    originalMapsRef.current.set(m, (m as any).map || null);
                  }
                });
              } else {
                (mesh.material as any).wireframe = wireframe;
                materialsSet.add(mesh.material);
                const mat = mesh.material as any;
                if (!originalMapsRef.current.has(mat)) {
                  originalMapsRef.current.set(mat, mat.map || null);
                }
              }
            }
          }
        });

        setStats({
          vertices: vertCount,
          triangles: Math.round(triCount),
          meshes: meshCount,
          materials: materialsSet.size
        });

        // Extract PBR maps
        const pbrList: PbrMapInfo[] = [];
        let mapIndex = 0;

        materialsSet.forEach((mat) => {
          const mAny = mat as any;
          const matName = mat.name || `Matériel #${mapIndex + 1}`;

          const checkAndAddTexture = (tex: THREE.Texture | null, typeName: PbrMapInfo['mapType']) => {
            if (!tex) return;
            let previewUrl: string | null = null;
            if (tex.image) {
              try {
                const img = tex.image as any;
                const canvas = document.createElement('canvas');
                canvas.width = img.width || 128;
                canvas.height = img.height || 128;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                  previewUrl = canvas.toDataURL();
                }
              } catch (e) {
                // CORS or tainted canvas fallback
              }
            }
            pbrList.push({
              id: `pbr-${mapIndex++}`,
              materialName: matName,
              mapType: typeName,
              previewUrl,
              texture: tex,
              width: (tex.image as any)?.width,
              height: (tex.image as any)?.height
            });
          };

          checkAndAddTexture(mAny.map, 'Albedo / Base Color');
          checkAndAddTexture(mAny.normalMap, 'Normal Map');
          checkAndAddTexture(mAny.roughnessMap, 'Roughness Map');
          checkAndAddTexture(mAny.metalnessMap, 'Metalness Map');
          checkAndAddTexture(mAny.emissiveMap, 'Emissive Map');
          checkAndAddTexture(mAny.aoMap, 'Ambient Occlusion');
        });

        setPbrMaps(pbrList);

        if (sceneRef.current) {
          sceneRef.current.add(obj);
        }

        // Adjust camera position based on model size
        const maxDim = Math.max(size.x, size.y, size.z);
        if (cameraRef.current && controlsRef.current) {
          cameraRef.current.position.set(maxDim * 1.8, maxDim * 1.2, maxDim * 2.2);
          controlsRef.current.target.set(0, size.y / 2, 0);
          controlsRef.current.update();
        }

        setIsLoading(false);
      },
      (xhr) => {
        if (xhr.total > 0) {
          const pct = Math.round((xhr.loaded / xhr.total) * 100);
          setLoadingProgress(pct);
        }
      },
      (err) => {
        console.error('Error loading .glb model:', err);
        setError('Impossible de charger ce modèle .glb (Vérifiez le lien CORS ou le format du fichier).');
        setIsLoading(false);
      }
    );
  }, [wireframe]);

  // Load initial model on mount or when model changes
  useEffect(() => {
    loadModel(currentModel);
  }, [currentModel, loadModel]);

  // Update wireframe on existing object
  useEffect(() => {
    if (currentObjectRef.current) {
      currentObjectRef.current.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.material) {
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach((m) => { (m as any).wireframe = wireframe; });
            } else {
              (mesh.material as any).wireframe = wireframe;
            }
          }
        }
      });
    }
  }, [wireframe]);

  // Handle previewing a PBR map on the 3D model
  useEffect(() => {
    if (!currentObjectRef.current) return;

    currentObjectRef.current.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const applyToMaterial = (mat: any) => {
          if (!mat) return;
          if (activeMapPreview) {
            mat.map = activeMapPreview.texture;
          } else {
            const orig = originalMapsRef.current.get(mat);
            mat.map = orig !== undefined ? orig : null;
          }
          mat.needsUpdate = true;
        };

        if (Array.isArray(mesh.material)) {
          mesh.material.forEach(applyToMaterial);
        } else {
          applyToMaterial(mesh.material);
        }
      }
    });
  }, [activeMapPreview]);

  // Handle File Upload (.glb / .gltf)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const url = URL.createObjectURL(file);
    const newModel: GlbModelItem = {
      id: `custom-${Date.now()}`,
      name: file.name.replace(/\.[^/.]+$/, ''),
      url: url,
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      isCustom: true
    };

    setModels((prev) => [newModel, ...prev]);
    setCurrentModel(newModel);
    e.target.value = '';
  };

  // Reset Camera view
  const handleResetCamera = () => {
    if (!currentObjectRef.current || !cameraRef.current || !controlsRef.current) return;
    const box = new THREE.Box3().setFromObject(currentObjectRef.current);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    cameraRef.current.position.set(maxDim * 1.8, maxDim * 1.2, maxDim * 2.2);
    controlsRef.current.target.set(0, size.y / 2, 0);
    controlsRef.current.update();
  };

  return (
    <div className="w-full h-[calc(100vh-4rem)] bg-zinc-100 flex flex-col overflow-hidden font-mono text-black relative">
      {/* Top Bar / Toolbar */}
      <div className="bg-white border-b border-black px-4 py-3 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-black text-white border border-black">
            <FileBox className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
              Visionneuse 3D .GLB
              <span className="text-[10px] bg-black text-white px-1.5 py-0.5 font-mono">PBR / GLTF</span>
            </h1>
            <p className="text-[11px] text-zinc-500 uppercase tracking-wider">
              {currentModel.name} {currentModel.size ? `(${currentModel.size})` : ''}
            </p>
          </div>
        </div>

        {/* Viewer Controls */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Upload Button */}
          <label className="flex items-center gap-1.5 px-3 py-1.5 bg-black text-white hover:bg-zinc-800 text-xs font-mono uppercase tracking-wider cursor-pointer border border-black transition-colors">
            <Upload className="w-3.5 h-3.5" />
            <span>Importer .GLB</span>
            <input 
              type="file" 
              accept=".glb,.gltf" 
              onChange={handleFileUpload} 
              className="hidden" 
            />
          </label>

          {/* Wireframe toggle */}
          <button
            onClick={() => setWireframe(!wireframe)}
            className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider border border-black transition-colors flex items-center gap-1.5 ${
              wireframe ? 'bg-black text-white' : 'bg-white hover:bg-zinc-100 text-black'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Fil de fer</span>
          </button>

          {/* Grid toggle */}
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider border border-black transition-colors flex items-center gap-1.5 ${
              showGrid ? 'bg-black text-white' : 'bg-white hover:bg-zinc-100 text-black'
            }`}
          >
            <GridIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Grille</span>
          </button>

          {/* 360 Auto-Rotate toggle */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider border border-black transition-colors flex items-center gap-1.5 ${
              autoRotate ? 'bg-black text-white' : 'bg-white hover:bg-zinc-100 text-black'
            }`}
          >
            <RotateCcw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Rotation 360°</span>
          </button>

          {/* Reset Camera button */}
          <button
            onClick={handleResetCamera}
            className="px-3 py-1.5 bg-white hover:bg-zinc-100 text-black text-xs font-mono uppercase tracking-wider border border-black transition-colors flex items-center gap-1.5"
            title="Recentrer la caméra"
          >
            <Compass className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Recentrer</span>
          </button>
        </div>
      </div>

      {/* Active PBR Map Banner Overlay */}
      {activeMapPreview && (
        <div className="bg-black text-white px-4 py-2 border-b border-black flex items-center justify-between text-xs font-mono z-20">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>Affichage de la carte <strong>{activeMapPreview.mapType}</strong> ({activeMapPreview.materialName}) sur le modèle 3D</span>
          </div>
          <button
            onClick={() => setActiveMapPreview(null)}
            className="px-2.5 py-1 bg-white text-black hover:bg-zinc-200 text-[10px] font-bold uppercase tracking-wider border border-white transition-colors flex items-center gap-1"
          >
            <EyeOff className="w-3 h-3" />
            <span>Restaurer l'aspect original</span>
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row relative overflow-hidden">
        {/* 3D Canvas Viewport */}
        <div ref={mountRef} className="flex-1 relative w-full h-full bg-zinc-200 cursor-grab active:cursor-grabbing">
          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-white/85 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-20">
              <div className="w-8 h-8 border-2 border-black border-t-transparent animate-spin" />
              <div className="text-xs font-black uppercase tracking-widest">
                Chargement du modèle 3D {loadingProgress > 0 ? `(${loadingProgress}%)` : ''}
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-2 border border-black text-xs font-mono uppercase tracking-wider flex items-center gap-2 z-30 shadow-lg">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {/* Stats Overlay (Bottom Left) */}
          <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md border border-black p-3 text-[11px] font-mono uppercase tracking-wider z-10 shadow-sm hidden sm:block">
            <div className="font-black border-b border-black/20 pb-1 mb-1.5 flex items-center justify-between gap-4">
              <span>Statistiques Géométrie</span>
              <Layers className="w-3.5 h-3.5" />
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-zinc-700">
              <div>Sommets:</div>
              <div className="font-bold text-black">{stats.vertices.toLocaleString()}</div>
              <div>Triangles:</div>
              <div className="font-bold text-black">{stats.triangles.toLocaleString()}</div>
              <div>Maillages:</div>
              <div className="font-bold text-black">{stats.meshes}</div>
              <div>Matériaux:</div>
              <div className="font-bold text-black">{stats.materials}</div>
            </div>
          </div>
        </div>

        {/* Sidebar: Library & PBR Maps Inspector */}
        <div className="w-full lg:w-80 bg-white border-t lg:border-t-0 lg:border-l border-black flex flex-col shrink-0 max-h-[45vh] lg:max-h-none overflow-y-auto">
          {/* Sidebar Tabs Header */}
          <div className="flex border-b border-black bg-zinc-50 shrink-0">
            <button
              onClick={() => setSidebarTab('models')}
              className={`flex-1 py-2.5 px-3 text-xs font-black uppercase tracking-wider border-r border-black transition-colors flex items-center justify-center gap-1.5 ${
                sidebarTab === 'models' ? 'bg-black text-white' : 'bg-white hover:bg-zinc-100 text-black'
              }`}
            >
              <FileBox className="w-3.5 h-3.5" />
              <span>Modèles ({models.length})</span>
            </button>
            <button
              onClick={() => setSidebarTab('pbr')}
              className={`flex-1 py-2.5 px-3 text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 ${
                sidebarTab === 'pbr' ? 'bg-black text-white' : 'bg-white hover:bg-zinc-100 text-black'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Cartes PBR ({pbrMaps.length})</span>
            </button>
          </div>

          {/* Tab 1: Models Library */}
          {sidebarTab === 'models' && (
            <div className="divide-y divide-black/10 overflow-y-auto flex-1">
              {models.map((item) => {
                const isSelected = currentModel.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setCurrentModel(item)}
                    className={`p-3.5 cursor-pointer transition-colors flex items-center justify-between gap-3 ${
                      isSelected ? 'bg-black text-white' : 'bg-white hover:bg-zinc-50 text-black'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2 border border-black/20 shrink-0 ${isSelected ? 'bg-zinc-800 text-white' : 'bg-zinc-100 text-black'}`}>
                        <FileBox className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold uppercase truncate">{item.name}</div>
                        <div className={`text-[10px] font-mono ${isSelected ? 'text-zinc-300' : 'text-zinc-500'}`}>
                          {item.size || 'Modèle 3D'} {item.isCustom ? '• Personnalisé' : ''}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-white" />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Tab 2: PBR Maps Inspector */}
          {sidebarTab === 'pbr' && (
            <div className="flex-1 overflow-y-auto divide-y divide-black/10">
              {pbrMaps.length === 0 ? (
                <div className="p-6 text-center text-zinc-500 text-xs font-mono">
                  Aucune texture PBR détectée sur ce modèle.
                </div>
              ) : (
                pbrMaps.map((mapInfo) => {
                  const isBeingPreviewed = activeMapPreview?.id === mapInfo.id;
                  return (
                    <div key={mapInfo.id} className="p-3 hover:bg-zinc-50 transition-colors">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <span className="text-[10px] font-black uppercase bg-black text-white px-1.5 py-0.5">
                            {mapInfo.mapType}
                          </span>
                          <div className="text-xs font-bold mt-1 text-black truncate" title={mapInfo.materialName}>
                            {mapInfo.materialName}
                          </div>
                        </div>
                        {mapInfo.width && mapInfo.height && (
                          <span className="text-[10px] text-zinc-500 font-mono shrink-0">
                            {mapInfo.width}×{mapInfo.height}
                          </span>
                        )}
                      </div>

                      {mapInfo.previewUrl ? (
                        <div className="space-y-2">
                          <div 
                            onClick={() => setSelectedTextureModal(mapInfo)}
                            className="relative group border border-black bg-zinc-200 h-24 overflow-hidden cursor-pointer"
                            title="Cliquer pour agrandir la texture"
                          >
                            <img 
                              src={mapInfo.previewUrl} 
                              alt={mapInfo.mapType} 
                              className="w-full h-full object-contain bg-zinc-900 group-hover:scale-105 transition-transform" 
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold uppercase gap-1">
                              <Maximize2 className="w-3.5 h-3.5" /> Agrandir
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setActiveMapPreview(isBeingPreviewed ? null : mapInfo)}
                              className={`flex-1 py-1.5 px-2 text-[11px] font-mono uppercase tracking-wider border border-black transition-colors flex items-center justify-center gap-1.5 ${
                                isBeingPreviewed ? 'bg-amber-400 text-black font-bold' : 'bg-black text-white hover:bg-zinc-800'
                              }`}
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>{isBeingPreviewed ? 'En cours sur le modèle' : 'Voir sur le modèle'}</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="h-16 border border-dashed border-black/30 flex items-center justify-center text-[10px] text-zinc-400">
                          Texture procédurale / Non affichable
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          <div className="p-4 border-t border-black bg-zinc-50 text-[11px] text-zinc-600 leading-relaxed shrink-0">
            <div className="font-black uppercase text-black mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-black" />
              <span>Inspecteur & Aperçu PBR</span>
            </div>
            Cliquez sur "Voir sur le modèle" pour projeter instantanément n'importe quelle carte PBR sur la géométrie 3D.
          </div>
        </div>
      </div>

      {/* Texture Zoom Modal */}
      {selectedTextureModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border-2 border-black max-w-lg w-full p-5 shadow-2xl font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-black mb-4">
              <div>
                <div className="text-[10px] font-black uppercase bg-black text-white px-1.5 py-0.5 inline-block mb-1">
                  {selectedTextureModal.mapType}
                </div>
                <h3 className="text-sm font-bold uppercase">{selectedTextureModal.materialName}</h3>
              </div>
              <button 
                onClick={() => setSelectedTextureModal(null)}
                className="p-1 border border-black hover:bg-black hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="border border-black bg-zinc-900 p-2 flex items-center justify-center h-80">
              {selectedTextureModal.previewUrl && (
                <img 
                  src={selectedTextureModal.previewUrl} 
                  alt={selectedTextureModal.mapType} 
                  className="max-h-full max-w-full object-contain"
                />
              )}
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-zinc-600">
              <span>Résolution: {selectedTextureModal.width || 'N/A'} × {selectedTextureModal.height || 'N/A'} px</span>
              <button
                onClick={() => setSelectedTextureModal(null)}
                className="px-4 py-1.5 bg-black text-white hover:bg-zinc-800 text-xs font-mono uppercase tracking-wider border border-black transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

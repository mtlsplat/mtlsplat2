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
  HelpCircle,
  FileText
} from 'lucide-react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

interface GlbModelItem {
  id: string;
  name: string;
  url: string;
  size?: string;
  isCustom?: boolean;
}

const DEFAULT_SAMPLE_MODELS: GlbModelItem[] = [
  {
    id: 'helmet',
    name: 'Damaged Helmet (PBR)',
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb',
    size: '2.5 MB'
  },
  {
    id: 'duck',
    name: 'Rubber Duck',
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb',
    size: '102 KB'
  },
  {
    id: 'flight-helmet',
    name: 'Flight Helmet',
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/FlightHelmet/glTF-Binary/FlightHelmet.glb',
    size: '5.8 MB'
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

  // Model statistics
  const [stats, setStats] = useState({
    vertices: 0,
    triangles: 0,
    meshes: 0,
    materials: 0
  });

  // Three.js instances ref
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const currentObjectRef = useRef<THREE.Object3D | null>(null);
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);
  const axesHelperRef = useRef<THREE.AxesHelper | null>(null);

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

        // Apply wireframe if enabled
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
                });
              } else {
                (mesh.material as any).wireframe = wireframe;
                materialsSet.add(mesh.material);
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
    // Reset file input
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
    <div className="w-full h-[calc(100vh-4rem)] bg-zinc-100 flex flex-col overflow-hidden font-mono text-black">
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
            className={`px-3 py-1.5 border border-black text-xs font-mono uppercase tracking-wider transition-colors ${
              wireframe ? 'bg-black text-white' : 'bg-white text-black hover:bg-black/5'
            }`}
            title="Basculer le mode filaire (Wireframe)"
          >
            Filaire
          </button>

          {/* Auto Rotate toggle */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`px-3 py-1.5 border border-black text-xs font-mono uppercase tracking-wider transition-colors ${
              autoRotate ? 'bg-black text-white' : 'bg-white text-black hover:bg-black/5'
            }`}
            title="Rotation automatique 360°"
          >
            Rotation 360°
          </button>

          {/* Grid toggle */}
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-1.5 border border-black transition-colors ${
              showGrid ? 'bg-black text-white' : 'bg-white text-black hover:bg-black/5'
            }`}
            title="Afficher / Masquer la grille"
          >
            <GridIcon className="w-4 h-4" />
          </button>

          {/* Axes toggle */}
          <button
            onClick={() => setShowAxes(!showAxes)}
            className={`p-1.5 border border-black transition-colors ${
              showAxes ? 'bg-black text-white' : 'bg-white text-black hover:bg-black/5'
            }`}
            title="Afficher / Masquer les axes 3D (XYZ)"
          >
            <Compass className="w-4 h-4" />
          </button>

          {/* Reset camera */}
          <button
            onClick={handleResetCamera}
            className="flex items-center gap-1 px-3 py-1.5 bg-white text-black hover:bg-black/5 border border-black text-xs font-mono uppercase tracking-wider transition-colors"
            title="Recentrer la caméra"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Recentrer</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row relative overflow-hidden">
        {/* 3D Canvas Viewport */}
        <div ref={mountRef} className="flex-1 relative w-full h-full bg-zinc-200 cursor-grab active:cursor-grabbing">
          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-20">
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
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md border border-black p-3 text-[11px] font-mono uppercase tracking-wider z-10 shadow-sm hidden sm:block">
            <div className="font-black border-b border-black/20 pb-1 mb-1.5 flex items-center justify-between gap-4">
              <span>Statistiques Géométrie</span>
              <Layers className="w-3.5 h-3.5" />
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-zinc-700">
              <div>Sommets (Verts):</div>
              <div className="font-bold text-black">{stats.vertices.toLocaleString()}</div>
              <div>Triangles (Faces):</div>
              <div className="font-bold text-black">{stats.triangles.toLocaleString()}</div>
              <div>Maillages (Meshes):</div>
              <div className="font-bold text-black">{stats.meshes}</div>
              <div>Matériaux:</div>
              <div className="font-bold text-black">{stats.materials}</div>
            </div>
          </div>
        </div>

        {/* Sidebar: Model Selector & Info */}
        <div className="w-full lg:w-80 bg-white border-t lg:border-t-0 lg:border-l border-black flex flex-col shrink-0 max-h-[40vh] lg:max-h-none overflow-y-auto">
          <div className="p-4 border-b border-black bg-zinc-50 flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Bibliothèque & Exemples
            </h2>
            <span className="text-[10px] bg-black text-white px-1.5 py-0.5">
              {models.length} modèles
            </span>
          </div>

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

          <div className="p-4 border-t border-black bg-zinc-50 text-[11px] text-zinc-600 leading-relaxed">
            <div className="font-black uppercase text-black mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-black" />
              <span>Guide d'utilisation .GLB</span>
            </div>
            Glissez-déposez ou cliquez sur <strong>Importer .GLB</strong> pour charger n'importe quel fichier 3D aux formats standards <code className="bg-black/10 px-1 py-0.5 text-black">.glb</code> ou <code className="bg-black/10 px-1 py-0.5 text-black">.gltf</code>.
          </div>
        </div>
      </div>
    </div>
  );
};

import { z } from "zod"

export const formSchema = z.object({
  images: z.array(z.instanceof(File)).optional().default([]),
  prompt: z.string().optional().default(""),
  condition_mode: z.enum(["concat", "fuse"]).default("concat"),
  quality: z.enum(["extra-low", "low", "medium", "high", "ultra"]).default("medium"),
  geometry_file_format: z.enum(["glb", "usdz", "fbx", "obj", "stl", "ply", "dae"]).default("glb"),
  use_hyper: z.boolean().default(false),
  tier: z.enum(["Regular", "Premium", "Enterprise"]).default("Regular"),
  TAPose: z.boolean().default(false),
  material: z.enum(["PBR", "Shaded", "Unlit", "Toon", "Realistic"]).default("PBR"),
  mesh_mode: z.enum(["Triangle", "Quad", "Adaptive"]).default("Quad"),
  mesh_simplify: z.boolean().default(true),
  mesh_smooth: z.boolean().default(true),
  texture_resolution: z.enum(["512", "1024", "2048", "4096", "8192", "16384"]).default("2048"),
  lighting_mode: z
    .enum(["auto", "studio", "outdoor", "indoor", "dramatic", "soft", "cinematic", "natural"])
    .default("auto"),
  camera_angle: z
    .enum(["auto", "front", "side", "top", "diagonal", "isometric", "perspective", "orthographic"])
    .default("auto"),
  background_removal: z.boolean().default(true),
  edge_enhancement: z.boolean().default(false),
  detail_boost: z.enum(["off", "low", "medium", "high", "ultra", "extreme"]).default("off"),
  detail_enhancement_mode: z.enum(["surface", "texture", "geometry", "all", "smart"]).default("all"),
  detail_preservation: z.boolean().default(true),
  surface_refinement: z.boolean().default(false),
  micro_detail_recovery: z.boolean().default(false),

  // Advanced Facial Enhancement
  facial_detail_enhancement: z.boolean().default(false),
  eye_clarity_boost: z.boolean().default(false),
  facial_feature_sharpening: z.boolean().default(false),
  skin_texture_enhancement: z.boolean().default(false),
  facial_symmetry_correction: z.boolean().default(false),
  skin_tone_adjustment: z.boolean().default(false),
  hair_detail_enhancement: z.boolean().default(false),
  expression_enhancement: z.boolean().default(false),
  age_progression: z.enum(["none", "younger", "older", "auto"]).default("none"),
  gender_enhancement: z.enum(["none", "masculine", "feminine", "neutral"]).default("none"),

  // Advanced AI features
  ai_upscaling: z.boolean().default(false),
  neural_enhancement: z.boolean().default(false),
  style_transfer: z.enum(["none", "realistic", "artistic", "cartoon", "anime", "sculpture"]).default("none"),
  adaptive_lod: z.boolean().default(false),
  physics_simulation: z.boolean().default(false),
  animation_ready: z.boolean().default(false),
  rigging_support: z.boolean().default(false),
  morph_targets: z.boolean().default(false),

  // Material and Rendering
  uv_optimization: z.boolean().default(true),
  normal_map_generation: z.boolean().default(false),
  ambient_occlusion: z.boolean().default(false),
  subsurface_scattering: z.boolean().default(false),
  metallic_roughness: z.boolean().default(false),
  emission_mapping: z.boolean().default(false),
  displacement_mapping: z.boolean().default(false),
  parallax_mapping: z.boolean().default(false),
  multi_material_support: z.boolean().default(false),
  texture_atlas_optimization: z.boolean().default(false),
  hdr_lighting: z.boolean().default(false),

  // Optimization and Export
  mesh_compression: z.enum(["none", "low", "medium", "high", "extreme"]).default("none"),
  texture_compression: z.enum(["none", "low", "medium", "high"]).default("none"),
  color_space: z.enum(["sRGB", "Linear", "Rec2020", "ACES", "DCI-P3"]).default("sRGB"),
  export_variants: z.array(z.enum(["web", "mobile", "desktop", "vr", "ar", "print", "game", "film"])).default(["web"]),
  lod_generation: z.boolean().default(false),
  batch_processing: z.boolean().default(false),
  version_control: z.boolean().default(false),

  // Quality Presets
  quality_preset: z
    .enum(["custom", "web-optimized", "mobile-friendly", "desktop-quality", "vr-ready", "print-quality", "cinematic"])
    .default("custom"),

  // Advanced Settings
  noise_reduction: z.boolean().default(false),
  artifact_removal: z.boolean().default(false),
  topology_optimization: z.boolean().default(false),
  symmetry_enforcement: z.boolean().default(false),
  proportions_correction: z.boolean().default(false),
})

export type FormValues = z.infer<typeof formSchema>

export function validateFormData(values: FormValues): boolean {
  const hasImages = values.images && values.images.length > 0
  const hasPrompt = values.prompt && values.prompt.trim().length > 0
  return hasImages || hasPrompt
}

// Quality presets configuration
export const qualityPresets = {
  "web-optimized": {
    quality: "medium",
    texture_resolution: "2048",
    mesh_compression: "medium",
    texture_compression: "medium",
    export_variants: ["web"],
    adaptive_lod: true,
  },
  "mobile-friendly": {
    quality: "low",
    texture_resolution: "1024",
    mesh_compression: "high",
    texture_compression: "high",
    export_variants: ["mobile"],
    adaptive_lod: true,
    mesh_simplify: true,
  },
  "desktop-quality": {
    quality: "high",
    texture_resolution: "4096",
    mesh_compression: "low",
    texture_compression: "low",
    export_variants: ["desktop"],
    ai_upscaling: true,
  },
  "vr-ready": {
    quality: "high",
    texture_resolution: "4096",
    mesh_compression: "medium",
    export_variants: ["vr"],
    adaptive_lod: true,
    physics_simulation: true,
  },
  "print-quality": {
    quality: "ultra",
    texture_resolution: "8192",
    mesh_compression: "none",
    export_variants: ["print"],
    detail_boost: "ultra",
    topology_optimization: true,
  },
  cinematic: {
    quality: "ultra",
    texture_resolution: "8192",
    mesh_compression: "none",
    export_variants: ["film"],
    detail_boost: "extreme",
    hdr_lighting: true,
    subsurface_scattering: true,
  },
}

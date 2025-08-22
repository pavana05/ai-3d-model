import { z } from "zod"

export const formSchema = z.object({
  images: z.array(z.instanceof(File)).optional().default([]),
  prompt: z.string().optional().default(""),
  condition_mode: z.enum(["concat", "fuse"]).default("concat"),
  quality: z.enum(["extra-low", "low", "medium", "high"]).default("medium"),
  geometry_file_format: z.enum(["glb", "usdz", "fbx", "obj", "stl"]).default("glb"),
  use_hyper: z.boolean().default(false),
  tier: z.enum(["Regular", "Premium"]).default("Regular"),
  TAPose: z.boolean().default(false),
  material: z.enum(["PBR", "Shaded"]).default("PBR"),
  mesh_mode: z.enum(["Triangle", "Quad"]).default("Quad"),
  mesh_simplify: z.boolean().default(true),
  mesh_smooth: z.boolean().default(true),
  texture_resolution: z.enum(["1024", "2048", "4096", "8192"]).default("2048"),
  lighting_mode: z.enum(["auto", "studio", "outdoor", "indoor", "dramatic", "soft"]).default("auto"),
  camera_angle: z.enum(["auto", "front", "side", "top", "diagonal", "isometric", "perspective"]).default("auto"),
  background_removal: z.boolean().default(true),
  edge_enhancement: z.boolean().default(false),
  detail_boost: z.enum(["off", "low", "medium", "high", "ultra"]).default("off"),
  detail_enhancement_mode: z.enum(["surface", "texture", "geometry", "all"]).default("all"),
  detail_preservation: z.boolean().default(true),
  surface_refinement: z.boolean().default(false),
  micro_detail_recovery: z.boolean().default(false),
  // Facial enhancement options
  facial_detail_enhancement: z.boolean().default(false),
  eye_clarity_boost: z.boolean().default(false),
  facial_feature_sharpening: z.boolean().default(false),
  skin_texture_enhancement: z.boolean().default(false),
  facial_symmetry_correction: z.boolean().default(false),
  // Advanced AI features
  ai_upscaling: z.boolean().default(false),
  neural_enhancement: z.boolean().default(false),
  adaptive_lod: z.boolean().default(false),
  physics_simulation: z.boolean().default(false),
  animation_ready: z.boolean().default(false),
  uv_optimization: z.boolean().default(true),
  normal_map_generation: z.boolean().default(false),
  ambient_occlusion: z.boolean().default(false),
  subsurface_scattering: z.boolean().default(false),
  metallic_roughness: z.boolean().default(false),
  emission_mapping: z.boolean().default(false),
  displacement_mapping: z.boolean().default(false),
  multi_material_support: z.boolean().default(false),
  texture_atlas_optimization: z.boolean().default(false),
  mesh_compression: z.enum(["none", "low", "medium", "high"]).default("none"),
  color_space: z.enum(["sRGB", "Linear", "Rec2020"]).default("sRGB"),
  export_variants: z.array(z.enum(["web", "mobile", "desktop", "vr", "ar", "print"])).default(["web"]),
  batch_processing: z.boolean().default(false),
  version_control: z.boolean().default(false),
})

export type FormValues = z.infer<typeof formSchema>

export function validateFormData(values: FormValues): boolean {
  const hasImages = values.images && values.images.length > 0
  const hasPrompt = values.prompt && values.prompt.trim().length > 0
  return hasImages || hasPrompt
}

# 3D Dinosaur Models Storage

This directory holds static 3D assets (`.glb` / `.gltf`) for DinoVerse.

## Convention

Store each dinosaur asset in its own folder named after the dinosaur slug:

```text
public/
└── models/
    └── dinosaurs/
        ├── tyrannosaurus-rex/
        │   ├── model.glb
        │   └── textures/
        └── triceratops/
            └── model.glb
```

Assets stored here can be referenced in code via absolute paths:
`/models/dinosaurs/<slug>/model.glb`

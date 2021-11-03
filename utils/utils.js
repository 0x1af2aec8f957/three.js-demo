import * as THREE from 'https://esm.sh/three';

export function getCenterByObject3D(object/* : THREE.Object3D */){ // 获取 Object3D 对象的中心点
    return getBoundingBoxByObject3D(object).getCenter(new THREE.Vector3()).clone();
}

export function toggleObject3DVisible(object/* : THREE.Object3D */, visible/* : Boolean */){ // Object3D 对象的显示与隐藏切换
    object.visible = visible ?? !object.visible;
}

export function getBoundingBoxByObject3D(object /* : THREE.Object3D */) { // 根据 Object3D 获取包围盒对象 Box3
    return new THREE.Box3().setFromObject(object);
}

export function getBoundingSphereByObject3D(object /* : THREE.Object3D */) { // 根据 Object3D 获取包围球对象 Sphere
    return getBoundingBoxByObject3D(object).getBoundingSphere(new THREE.Sphere());
}

export function showBoundingBoxByObject3D(object /* : THREE.Object3D */, scene) { // 根据 Object3D 获取包围盒对象 Box3 并模拟展示
    const boundingBox = getBoundingBoxByObject3D(object);
    const helper = new THREE.Box3Helper(boundingBox, 0xff0000);
    scene.add(helper);
}

export function showBoundingSphereOutlineByObject3D(object /* : THREE.Object3D */, scene/* : THREE.Scene */) { // 展示实体包围球
    const boundingSphere = getBoundingSphereByObject3D(object);
    const geometryCenter = boundingSphere.center;
    const geometry = new THREE.SphereGeometry(boundingSphere.radius, 32, 16);

    geometry.translate(geometryCenter.x, geometryCenter.y, geometryCenter.z);
    const material = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        transparent: true,
        // 设置材质透明度
        opacity: 0.4
    });

    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);
}

export function showBoundingBoxOutlineByObject3D(object /* : THREE.Object3D */, scene/* : THREE.Scene */) { // 展示实体包围盒
    const boundingBox = getBoundingBoxByObject3D(object);
    const geometrySize = boundingBox.getSize(new THREE.Vector3());
    const geometryCenter = boundingBox.getCenter(new THREE.Vector3());
    const geometry = new THREE.BoxGeometry(geometrySize.x, geometrySize.y, geometrySize.z);

    geometry.translate(geometryCenter.x, geometryCenter.y, geometryCenter.z);
    const material = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        transparent: true,
        // 设置材质透明度
        opacity: 0.4
    });

    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
}

export function showBrushStrokesBuyBufferGeometry(geometry/* : THREE.BuffergGeometry */, color /* THREE.Color_Hex_or_String */, offset = 0.00328083989501/* : number */){ // 绘制描边（跟THREE.OutlinePass是两个概念）
    // const vertices = geometry.attributes.position.array; // 顶点数据

    // const vector3Vertices = new THREE.Float32BufferAttribute( vertices, 3 )// Vector3格式的顶点数据

    // const shape = vector3Vertices.reduce((shapes, vec, index) => {
    //     shapes[index === 0 ? 'moveTo' : 'lineTo'](vec.X * offset, vec.Y * offset);
    //     return shapes;
    // }, new THREE.Shape());

    const cubeEdges = new THREE.EdgesGeometry(geometry, 1); // 边缘辅助对象
    const lineMaterial = new THREE.LineBasicMaterial( { color: color, fog: false, needsUpdate: true, side: THREE.DoubleSide } );
    
    return new THREE.LineSegments( cubeEdges, lineMaterial );
    // return new THREE.Line( geometry, lineMaterial );
}

// TODO 需要给定一个朝向，用于观测不同的场景面的最佳位置
export function moveCameraByObject3D(camera/*: THREE.Camera */, object /* : THREE.Object3D */, control/*: THREE.OrbitControls */, distanceOffset = 280 /* 距离偏移量 */, normalizeVector/* THREE.Vector3 方向向量 */) { // 根据传入的物体移动相机位置（获取最佳位置）
    /// doc: https://github.com/mrdoob/three.js/issues/6784
    const boundingBox = getBoundingBoxByObject3D(object); // 获取包围盒
    const boundingSphere = boundingBox.getBoundingSphere(new THREE.Sphere()); // 获取包围球

    control.target.copy(boundingSphere.center); // 改变控制器
    control.update();

    const distance = boundingSphere.radius / Math.tan(camera.fov / 2); // 摄像机距离中心点的坐标
    const directionVec = normalizeVector?.clone().normalize() ?? boundingSphere.center.clone().normalize(); // 获得方向向量
    const cameraVec = boundingSphere.center.clone().add(new THREE.Vector3(distance + distanceOffset, 0, 0));
    camera.position.copy(cameraVec);
    // camera.position.copy(camera.getWorldDirection().normalize().negate().clone().multiplyScalar(boundingSphere.radius * 2).clone().add(boundingSphere.center));

    // TODO
    // const angleA = boundingBox.max.angleTo(directionVec);
    // const angleB = boundingBox.min.angleTo(directionVec);
}


export function deepCopyByObject3D(object /* : THREE.Object3D */) { // 深拷贝 Object3D(Mesh) 对象
    if (object.type === 'Mesh') {
        return new THREE.Mesh(object.geometry.clone(), object.material.clone());
    }

    return object.clone();
}
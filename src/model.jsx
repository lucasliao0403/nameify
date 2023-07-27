

import React, { useRef, Suspense, useEffect, useState,  } from "react";
import { Canvas , useFrame} from "@react-three/fiber";
import { OrbitControls, Preload, useGLTF, RoundedBox, Sky } from "@react-three/drei";
import {motion, useScroll} from "framer-motion";


import CanvasLoader from "./Loader.jsx";


const Box = () => {
    return (
      <mesh rotation-x={Math.PI * -0.5}>
        <planeBufferGeometry args={[20, 20]} />
        <meshStandardMaterial color={"green"} />
        
      </mesh>
    );
  };

export function Model() {

    const model = useGLTF('./assets/scene.gltf');
    // console.log(model);
    model.scene.scale.set(0.2,0.2,0.2);


    // rotation doesnt work lol:

    // useFrame(() => { 
    //     model.scene.rotation.y += 0.05;
    //     console.log("moving")

    //     // model.scene.rotation.z += 0.03;
    //   })


    // console.log(model);

    return (
        <mesh rotation={[0, 0, 0]}>
            <hemisphereLight intensity={0.15} groundColor='white' /> 
            <pointLight intensity={10} />
             <ambientLight intensity={5} />

            <primitive
            object={model.scene}
            position = {[0.25,-3,0]} // move center of cat
            />

        </mesh>
    )
}

export function ModelCanvas() {

  

    return (
       
            <Canvas
                id = "canvas"
                frameloop='demand'
                shadows
                // dpr={[1, 2]}
                camera={{ position: [15, 0, 5], fov: 25 }}
                gl={{ preserveDrawingBuffer: true }}

                
            >
                <Suspense fallback={<CanvasLoader />}>
                    <OrbitControls
                        enableZoom={true}
                        maxPolarAngle={Math.PI/2 }
                        minPolarAngle={Math.PI/2}
                        enableRotate={true}
                        minDistance={15}
                        maxDistance={50}
                    />
                    <RoundedBox args={[10, 100, 10]} position = {[0.25,-53,0]} radius={0.1}>
                        <meshLambertMaterial attach="material" color={"green"} />
                    </RoundedBox>

                    {/* <Sky 
                    distance={45}
                    mieCoefficient = {0.001}
                    /> */}

                    <Model/>

                </Suspense>

                <Preload all />
            </Canvas>

    )
}
"use client";

import { useEffect, useState, type RefObject } from "react";

/** Composite the synchronized colour/matte halves of a single decoded frame. */
export function useWalkingCutout(
  video: RefObject<HTMLVideoElement | null>,
  canvas: RefObject<HTMLCanvasElement | null>,
) {
  const [painted, setPainted] = useState(false);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    const media = video.current;
    const surface = canvas.current;
    if (!media || !surface) return;
    const gl = surface.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: true,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: true,
      antialias: false,
    });
    if (!gl) {
      setUnavailable(true);
      return;
    }
    const shaders: WebGLShader[] = [];
    function shader(type: number, source: string) {
      const result = gl!.createShader(type);
      if (!result) throw new Error("Unable to create walking shader");
      shaders.push(result);
      gl!.shaderSource(result, source);
      gl!.compileShader(result);
      if (!gl!.getShaderParameter(result, gl!.COMPILE_STATUS))
        throw new Error("Unable to compile walking shader");
      return result;
    }
    const program = gl.createProgram();
    const buffer = gl.createBuffer();
    const texture = gl.createTexture();
    const dispose = () => {
      if (texture) gl.deleteTexture(texture);
      if (buffer) gl.deleteBuffer(buffer);
      if (program) gl.deleteProgram(program);
      shaders.forEach((value) => gl.deleteShader(value));
    };
    try {
      if (!program || !buffer || !texture) throw new Error("WebGL unavailable");
      gl.attachShader(
        program,
        shader(
          gl.VERTEX_SHADER,
          `
        attribute vec2 position;
        varying vec2 uv;
        void main() {
          uv = (position + 1.0) * 0.5;
          gl_Position = vec4(position, 0.0, 1.0);
        }
      `,
        ),
      );
      gl.attachShader(
        program,
        shader(
          gl.FRAGMENT_SHADER,
          `
        precision mediump float;
        uniform sampler2D frame;
        varying vec2 uv;
        void main() {
          vec3 colour = texture2D(frame, vec2(uv.x * 0.5, uv.y)).rgb;
          float matte = texture2D(frame, vec2(0.5 + uv.x * 0.5, uv.y)).r;
          float alpha = smoothstep(0.04, 0.96, matte);
          // Match the browser compositor and remove RGB from transparent pixels.
          gl_FragColor = vec4(colour * alpha, alpha);
        }
      `,
        ),
      );
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS))
        throw new Error("Unable to link walking shader");
      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
        gl.STATIC_DRAW,
      );
      const position = gl.getAttribLocation(program, "position");
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.viewport(0, 0, surface.width, surface.height);
    } catch {
      dispose();
      setUnavailable(true);
      return;
    }
    let textureWidth = 0;
    let textureHeight = 0;
    let firstFrame = true;
    const draw = () => {
      if (media.readyState < 2 || media.seeking || gl.isContextLost()) return;
      try {
        if (
          textureWidth !== media.videoWidth ||
          textureHeight !== media.videoHeight
        ) {
          textureWidth = media.videoWidth;
          textureHeight = media.videoHeight;
          surface.width = textureWidth / 2;
          surface.height = textureHeight;
          gl.viewport(0, 0, surface.width, surface.height);
          gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            media,
          );
        } else {
          // Reuse the GPU allocation as decoded frames arrive.
          gl.texSubImage2D(
            gl.TEXTURE_2D,
            0,
            0,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            media,
          );
        }
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      } catch {
        setPainted(false);
        setUnavailable(true);
        return;
      }
      if (firstFrame) {
        firstFrame = false;
        setPainted(true);
      }
    };
    const lost = () => {
      setPainted(false);
      setUnavailable(true);
    };
    // Render only decoded frames, not an idle animation loop or CPU pixel scan.
    media.addEventListener("loadeddata", draw);
    media.addEventListener("seeked", draw);
    surface.addEventListener("webglcontextlost", lost);
    draw();
    return () => {
      media.removeEventListener("loadeddata", draw);
      media.removeEventListener("seeked", draw);
      surface.removeEventListener("webglcontextlost", lost);
      dispose();
    };
  }, [video, canvas]);
  return { painted, unavailable };
}

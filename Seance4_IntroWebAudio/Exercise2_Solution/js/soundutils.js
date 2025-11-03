async function loadAndDecodeSound(url, ctx) {
    const response = await fetch(url);
    const sound = await response.arrayBuffer();
 
    console.log("Sound loaded as arrayBuffer: " + url);
     
    const decodedSound = await ctx.decodeAudioData(sound);
    console.log("Sound decoded: " + url);
 
    return decodedSound;
}
 
function buildAudioGraph(ctx, buffer) {
    let bufferSource = ctx.createBufferSource();
    bufferSource.buffer = buffer;
    bufferSource.connect(ctx.destination);
    return bufferSource;  
}
 
function playSound(ctx, buffer, startTime, endTime) {
    if(startTime < 0) startTime = 0;
    if(endTime > buffer.duration) endTime = buffer.duration;
 
    let bufferSource = buildAudioGraph(ctx, buffer);
    bufferSource.start(0, startTime, endTime);
}
 
export { loadAndDecodeSound, playSound };

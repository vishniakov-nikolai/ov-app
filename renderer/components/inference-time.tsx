export default function InferenceTime({ value }) {
  return <div className="text-center p-4">
    Inference time:&nbsp;
    { formatNanoseconds(value) }ms
  </div>
}

function formatNanoseconds(bigNumber) {
  return Math.floor(Number(bigNumber) / 1000000);
}

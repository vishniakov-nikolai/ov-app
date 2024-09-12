export function Header({ section }: { section?: string }) {
  return <nav className="flex p-4 border-b items-center shadow-md">
    <img
      className="w-[145px] mt-[2px]"
      src="/svg/ov-logo.svg" alt="OpenVINO logo" />
    <p className="text-3xl ml-2 font-medium pr-4">App</p>
    { section && <p className="text-2xl pl-4 border-l">{section}</p> }

  </nav>;
}

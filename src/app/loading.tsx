import { PanelLoader } from "@/components/panel-loader";
export default function Loading() {
  return (
    <div className="page-loader" role="status">
      <PanelLoader />
    </div>
  );
}

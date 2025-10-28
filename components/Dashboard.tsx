export default function Dashboard() {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2 className="mb-0">
          <i className="fas fa-chart-line me-3"></i>
          Dữ liệu trực tuyến từ robot
        </h2>
      </div>

      <div className="row g-4 mt-2">
        {/* Lệnh gần đây nhất */}
        <div className="col-lg-6 col-12">
          <div className="data-card">
            <div className="data-card-header">
              <i className="fas fa-terminal me-2"></i>
              Lệnh gần đây nhất
            </div>
            <div className="data-card-body">
              <p className="text-muted mb-0">Chưa có dữ liệu</p>
            </div>
          </div>
        </div>

        {/* Tiến trình công việc hiện tại */}
        <div className="col-lg-6 col-12">
          <div className="data-card">
            <div className="data-card-header">
              <i className="fa-solid fa-chart-simple me-2"></i>
              Tiến trình công việc hiện tại
            </div>
            <div className="data-card-body2">
              <div className="d-flex justify-content-between align-items-center">
                <div className="text-center">
                  <div className="data-value">--°%</div>
                  <small className="text-muted">Tiến độ làm việc</small>
                </div>
                <div className="text-center">
                  <div className="data-value">--°C</div>
                  <small className="text-muted">Nhiệt độ</small>
                </div>
                <div className="text-center">
                  <div className="data-value">--%</div>
                  <small className="text-muted">Độ ẩm</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Thông báo vật cản */}
        <div className="col-lg-6 col-12">
          <div className="data-card">
            <div className="data-card-header">
              <i className="fas fa-triangle-exclamation me-2"></i>
              Thông báo vật cản
            </div>
            <div className="data-card-body">
              <p className="text-muted mb-0">Không có vật cản</p>
            </div>
          </div>
        </div>

        {/* Trạng thái robot */}
        <div className="col-lg-6 col-12">
          <div className="data-card">
            <div className="data-card-header">
              <i className="fas fa-circle-info me-2"></i>
              Trạng thái robot hiện tại
            </div>
            <div className="data-card-body">
              <div className="status-indicator">
                <span className="status-dot"></span>
                <span>Đang chờ kết nối</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
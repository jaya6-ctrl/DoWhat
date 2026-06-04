import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // 允许局域网内手机直接访问 dev server 的 HMR / _next 资源
  // 用通配符覆盖所有 192.168.x.x，避免不同网卡 IP 切换时漏配
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "172.16.*.*"],
};

export default nextConfig;

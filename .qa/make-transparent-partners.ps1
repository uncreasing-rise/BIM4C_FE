Add-Type -AssemblyName System.Drawing

$sourceDirectory = Join-Path $PSScriptRoot "..\public\images\partners"
$outputDirectory = Join-Path $sourceDirectory "transparent"
[IO.Directory]::CreateDirectory($outputDirectory) | Out-Null

foreach ($name in @("masterise", "gamuda", "ecopark", "namlong")) {
  $sourcePath = Join-Path $sourceDirectory "$name.png"
  $source = [Drawing.Bitmap]::FromFile($sourcePath)
  $result = New-Object Drawing.Bitmap $source.Width, $source.Height, ([Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $left = $source.Width; $top = $source.Height; $right = -1; $bottom = -1
  for ($y = 0; $y -lt $source.Height; $y++) {
    for ($x = 0; $x -lt $source.Width; $x++) {
      $pixel = $source.GetPixel($x, $y)
      $darkness = 255 - [Math]::Min($pixel.R, [Math]::Min($pixel.G, $pixel.B))
      [int]$candidateAlpha = [Math]::Round(($darkness - 5) * 1.25)
      [int]$alpha = [Math]::Min([int]$pixel.A, [Math]::Min(255, [Math]::Max(0, $candidateAlpha)))
      if ($alpha -gt 8) {
        $result.SetPixel($x, $y, [Drawing.Color]::FromArgb($alpha, 255, 255, 255))
        if ($x -lt $left) { $left = $x }; if ($x -gt $right) { $right = $x }
        if ($y -lt $top) { $top = $y }; if ($y -gt $bottom) { $bottom = $y }
      }
    }
  }
  if ($right -ge $left -and $bottom -ge $top) {
    $padding = 4
    $cropLeft = [Math]::Max(0, $left - $padding); $cropTop = [Math]::Max(0, $top - $padding)
    $cropRight = [Math]::Min($source.Width - 1, $right + $padding); $cropBottom = [Math]::Min($source.Height - 1, $bottom + $padding)
    $rectangle = New-Object Drawing.Rectangle $cropLeft, $cropTop, ($cropRight - $cropLeft + 1), ($cropBottom - $cropTop + 1)
    $cropped = $result.Clone($rectangle, [Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $cropped.Save((Join-Path $outputDirectory "$name.png"), [Drawing.Imaging.ImageFormat]::Png)
    $cropped.Dispose()
  }
  $result.Dispose(); $source.Dispose()
}

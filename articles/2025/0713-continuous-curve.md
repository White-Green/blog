---
title: 滑らかな角丸矩形を目指して
description: 角丸付き矩形を円で構成したときの違和感を緩和するため、2階微分が連続な曲線を探し効率的な描画を行います
pubDate: "2025-07-13T15:00:00+09:00"
author: engineering
heroImage: /article_resources/2025/0713-continuous-curve/hero.webp
---
角を丸めた矩形はいろいろなデザインで利用されています。
これをシンプルに実現したとき、矩形の辺部分は直線で角部分を円で構成することになります。
このとき角部分はこのようになります。

![円によって構成した角丸](/article_resources/2025/0713-continuous-curve/circle.webp)

計算上滑らか(1階微分可能の意)に接続されているはずが、辺を構成する直線と角を構成する円との接続部に角が見えます。
これは接続部において2階微分が連続になっていないためです。
というわけで2階微分が連続になるような角丸の構成方法を考えていきます。

### 角丸を構成する曲線
構成方法は何種類か考えられますが、描画の実装まで考慮して多項式で構成します。
先にゴールを示しておくと、こんな感じです。

![角丸を描画するための多項式のグラフ](/article_resources/2025/0713-continuous-curve/curve-graph.webp)

$x\in\set{-1,1}$の範囲の曲線で角丸を構成し、適当な線形変換を施して描画します。
つまり、この多項式に要求されるのは
- 偶関数であること
- $f(-1)=0$
- $\frac{d}{dx}f(-1)=1$
- $\frac{d^2}{dx^2}f(-1)=0$

という条件です。
偶関数の多項式であるという条件から求める関数$f$は
$$
f(x)=\sum_{i=0}a_ix^{2i}
$$
という形式で構成されます。
多項式なので1階および2階微分は簡単に計算でき(実際はMathematicaさんにお任せしたので式を起こすのがめんどい)、$a_i$に関する方程式として解くと
$$
\begin{array}{c c l l}
a_0&=&\frac{5}{8} \\
a_1&=&-\frac{3}{4} \\
a_2&=&\frac{1}{8} \\
a_i&=&0&(i>2)
\end{array}
$$
という解が得られます(実際はもっとあるが、4次式の範囲だとこれだけ)。

### 曲線の描画
求まった曲線の式$f(x)=\frac{1}{8}x^4-\frac{3}{4}x^2+\frac{5}{8}$で角丸を構成するのはよいとして、実際にはコンピュータでの描画を効率的に行う必要があります。
描画と一口に言っても要件としては
- 範囲内の単色塗りつぶし
- テクスチャの貼りつけ
- 幅を指定した境界線の描画

あたりが考えられます。
すべてをカバーするためにはSigned Distance Field(SDF)を構築できればよいです。
Fragment Shaderで描画することを考えると、任意の点$(x,y)$に対して
$$
\min_{-1\le s\le 1}{\sqrt{(x-s)^2+(y-f(s))^2}}
$$
を計算できればよいです。
偶関数であるという性質を利用すると、あらかじめ$x$の符号を消しておくことにより探索範囲を$-1\le s\le 1$から$0\le s\le 1$にできます。
$0\le s\le 1$の範囲にのみ注目すると、任意の点$(x,y)$に対して曲線とのユークリッド距離はただ一つの極小値をもちます。
たとえば$(x,y)=(0.5,0.1)$のときの曲線とのユークリッド距離はこのようになります(横軸が$s$)。

![(x,y)=(0.5,0.1)のときの曲線とのユークリッド距離](/article_resources/2025/0713-continuous-curve/euclidean-distance.webp)

極小値がただ一つであることで何が嬉しいかというと、三分探索が正当になります。
これにより任意の点$(x,y)$と曲線$y=f(x)$のユークリッド距離が求まり、その点が曲線の上側と下側のどちらに位置するのか(自明に計算可能)によって符号を調整すればSDFが構築できました。

以上により、2階微分が連続となる角丸つき矩形の描画ができました。

![2階微分が連ぞkうである角丸矩形の角部分](/article_resources/2025/0713-continuous-curve/continuous-curve.webp)

円のときに発生していた接続部分の違和感が緩和されていることがわかります。

とりあえず描画はできましたが、シェーダ内部で三分探索(並列度を高められるので三分探索といいつつ五分割ぐらいしている)を行っているので円の描画よりも重いです。
どちらかというと円の性質が良すぎるという話なので多少は良いのですが、もう少し効率化したいなと思っています。

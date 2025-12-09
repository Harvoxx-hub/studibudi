# KaTeX Math Rendering Guide

This application uses [KaTeX](https://katex.org/) to render mathematical formulas and symbols in flashcards and quizzes, making it perfect for science students.

## Supported Math Syntax

### Inline Math
Use single dollar signs `$...$` or LaTeX delimiters `\(...\)` for inline math expressions:

- `$x^2 + y^2 = r^2$` - Pythagorean theorem
- `$E = mc^2$` - Einstein's mass-energy equivalence
- `$\frac{a}{b}$` - Fractions
- `$\sqrt{x}$` - Square root
- `$\sum_{i=1}^{n} x_i$` - Summation

### Display Math
Use double dollar signs `$$...$$` or LaTeX delimiters `\[...\]` for block-level math expressions:

- `$$\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}$$` - Gaussian integral
- `$$\lim_{n \to \infty} \frac{1}{n} = 0$$` - Limit

## Common Math Symbols

### Greek Letters
- `$\alpha, \beta, \gamma, \delta$` - Lowercase Greek letters
- `$\Alpha, \Beta, \Gamma, \Delta$` - Uppercase Greek letters
- `$\pi, \theta, \lambda, \mu, \sigma$` - Common Greek letters

### Operators
- `$\times, \div, \pm, \mp$` - Basic operators
- `$\leq, \geq, \neq, \approx$` - Comparison operators
- `$\in, \notin, \subset, \subseteq$` - Set operators
- `$\sum, \prod, \int, \oint$` - Large operators

### Subscripts and Superscripts
- `$x^2$` - Superscript (x squared)
- `$x_2$` - Subscript (x sub 2)
- `$x^{n+1}$` - Complex superscript
- `$x_{i,j}$` - Complex subscript

### Fractions and Roots
- `$\frac{a}{b}$` - Fraction
- `$\sqrt{x}$` - Square root
- `$\sqrt[n]{x}$` - Nth root
- `$\frac{\partial f}{\partial x}$` - Partial derivative

### Matrices
- `$\begin{pmatrix} a & b \\ c & d \end{pmatrix}$` - 2x2 matrix
- `$\begin{bmatrix} 1 & 2 \\ 3 & 4 \end{bmatrix}$` - Matrix with brackets

## Examples for Science Students

### Physics
- **Kinetic Energy**: `$E_k = \frac{1}{2}mv^2$`
- **Force**: `$F = ma$`
- **Wave Equation**: `$v = f\lambda$`
- **Schrödinger Equation**: `$$i\hbar\frac{\partial}{\partial t}\Psi = \hat{H}\Psi$$`

### Chemistry
- **Ideal Gas Law**: `$PV = nRT$`
- **Molarity**: `$M = \frac{n}{V}$`
- **Reaction Rate**: `$r = k[A]^m[B]^n$`

### Biology
- **Exponential Growth**: `$N(t) = N_0 e^{rt}$`
- **Hardy-Weinberg**: `$p^2 + 2pq + q^2 = 1$`

### Mathematics
- **Quadratic Formula**: `$$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$$`
- **Derivative**: `$\frac{d}{dx}f(x) = \lim_{h \to 0}\frac{f(x+h) - f(x)}{h}$`
- **Integral**: `$\int_a^b f(x)dx = F(b) - F(a)$`

## Usage in Flashcards and Quizzes

Simply type your math expressions using the syntax above in:
- Flashcard front/back text
- Quiz questions
- Quiz answer options
- Quiz explanations

The math will be automatically rendered when viewing or studying!

## Tips

1. **Spacing**: Use `\,` for thin space, `\;` for medium space, `\quad` for large space
2. **Text in Math**: Use `\text{your text}` to include regular text in math mode
3. **Colors**: KaTeX doesn't support colors, but you can use text formatting outside math blocks
4. **Multi-line**: Use `$$...$$` for display math that spans multiple lines

For more examples and documentation, visit [KaTeX Documentation](https://katex.org/docs/supported.html).


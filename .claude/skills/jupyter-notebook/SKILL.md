# Jupyter Notebook Skill

## Overview
Help with Jupyter notebooks for data science and machine learning workflows. Execute cells, debug ML errors, visualize data, and optimize pandas/numpy/scikit-learn code. Use the NotebookEdit and NotebookRead tools for all notebook operations.

## When to Use
- Working with .ipynb files
- Debugging ML model errors or data processing pipelines
- Improving notebook structure, performance, or readability
- Data exploration and visualization tasks
- Converting between notebook and Python script formats

## Core Tools for Notebooks

```
NotebookRead  - Read notebook cells and outputs
NotebookEdit  - Edit, insert, or delete cells
Bash          - Run: jupyter nbconvert, papermill, etc.
```

## Reading Notebooks

Always read the notebook first to understand context:
```
NotebookRead path/to/notebook.ipynb
```

This shows all cells with their types (code/markdown) and outputs (stdout, stderr, display_data, error).

## Editing Notebook Cells

### Replace cell content
```
NotebookEdit(
  notebook_path="notebook.ipynb",
  cell_id="cell-uuid",           # from NotebookRead
  new_source="new code here"
)
```

### Insert new cell
```
NotebookEdit(
  notebook_path="notebook.ipynb",
  cell_id="after-this-cell-id",  # insert after this cell
  edit_mode="insert",
  cell_type="code",              # or "markdown"
  new_source="new cell content"
)
```

### Delete a cell
```
NotebookEdit(
  notebook_path="notebook.ipynb",
  cell_id="cell-to-delete",
  edit_mode="delete",
  new_source=""
)
```

## Common ML Error Patterns

### Shape Mismatch Errors
```
ValueError: operands could not be broadcast together with shapes (100,) (100,1)
```
Fix: Use `.reshape(-1, 1)` or `.flatten()` or check `X.shape` vs expected input.

```python
# Debug pattern
print(f"X shape: {X.shape}, y shape: {y.shape}")
print(f"X dtype: {X.dtype}, y dtype: {y.dtype}")
```

### NaN/Inf in Data
```python
# Check for NaN
print(df.isnull().sum())
print(np.isnan(X).sum())
print(np.isinf(X).sum())

# Fix
df = df.dropna()  # or
df = df.fillna(df.mean())
X = np.nan_to_num(X, nan=0.0, posinf=1e10, neginf=-1e10)
```

### Memory Errors
```python
# Check memory usage
print(df.memory_usage(deep=True).sum() / 1e9, "GB")
print(df.dtypes)

# Optimize dtypes
df['int_col'] = df['int_col'].astype('int32')  # was int64
df['float_col'] = df['float_col'].astype('float32')  # was float64
df['category_col'] = df['category_col'].astype('category')

# Process in chunks
chunk_size = 10000
for chunk in pd.read_csv('large_file.csv', chunksize=chunk_size):
    process(chunk)
```

### CUDA/GPU Errors
```python
import torch
print(torch.cuda.is_available())
print(torch.cuda.device_count())
# Move to CPU for debugging
model = model.cpu()
X = X.cpu()
```

## Pandas Patterns

### Efficient Data Loading
```python
# Specify dtypes upfront for large files
dtypes = {'id': 'int32', 'value': 'float32', 'category': 'category'}
df = pd.read_csv('data.csv', dtype=dtypes, parse_dates=['date_col'])
```

### Data Exploration Template
```python
# Quick EDA
print(f"Shape: {df.shape}")
print(f"\nDtypes:\n{df.dtypes}")
print(f"\nMissing values:\n{df.isnull().sum()[df.isnull().sum() > 0]}")
print(f"\nDescribe:\n{df.describe()}")
print(f"\nSample:\n{df.head()}")
```

### Common Transformations
```python
# Apply function efficiently
df['new_col'] = df['col'].map(func)          # element-wise (fastest)
df['new_col'] = df['col'].apply(func)         # element-wise with overhead
df['new_col'] = df.apply(func, axis=1)        # row-wise (slowest)

# Vectorized operations (always prefer over apply)
df['price_tax'] = df['price'] * 1.1
df['full_name'] = df['first'] + ' ' + df['last']

# GroupBy patterns
result = df.groupby('category').agg({
    'value': ['mean', 'std', 'count'],
    'sales': 'sum'
})
```

## NumPy Patterns

### Performance Tips
```python
# Prefer vectorized over loops
# ❌ Slow
result = [x**2 for x in arr]

# ✅ Fast
result = arr ** 2

# Boolean indexing (fast filtering)
mask = arr > threshold
filtered = arr[mask]

# Efficient matrix operations
# Use @ for matrix multiplication
C = A @ B          # same as np.dot(A, B)
```

## Scikit-learn Patterns

### Pipeline Template
```python
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.model_selection import cross_val_score

pipe = Pipeline([
    ('imputer', SimpleImputer(strategy='median')),
    ('scaler', StandardScaler()),
    ('model', RandomForestClassifier(n_estimators=100, random_state=42))
])

# Cross-validate
scores = cross_val_score(pipe, X, y, cv=5, scoring='accuracy')
print(f"CV Score: {scores.mean():.3f} ± {scores.std():.3f}")
```

### Debugging Model Performance
```python
from sklearn.metrics import classification_report, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns

# Fit and evaluate
pipe.fit(X_train, y_train)
y_pred = pipe.predict(X_test)

print(classification_report(y_test, y_pred))

# Confusion matrix
cm = confusion_matrix(y_test, y_pred)
sns.heatmap(cm, annot=True, fmt='d')
plt.title('Confusion Matrix')
plt.show()
```

## Visualization Patterns

### Matplotlib/Seaborn Setup
```python
import matplotlib.pyplot as plt
import seaborn as sns

# Set style
plt.style.use('seaborn-v0_8-whitegrid')
sns.set_palette('husl')

# Figure sizing
fig, axes = plt.subplots(1, 2, figsize=(12, 5))
```

### Quick EDA Plots
```python
# Distribution of all numeric columns
df.hist(figsize=(15, 10), bins=30)
plt.tight_layout()
plt.show()

# Correlation heatmap
plt.figure(figsize=(10, 8))
sns.heatmap(df.corr(), annot=True, fmt='.2f', cmap='coolwarm', center=0)
plt.show()

# Scatter with regression line
sns.regplot(data=df, x='feature', y='target', scatter_kws={'alpha': 0.5})
```

## Notebook Structure Best Practices

### Recommended Cell Organization
```
1. [Markdown] # Title and description
2. [Code]     # Imports
3. [Code]     # Constants and config
4. [Markdown] ## Data Loading
5. [Code]     # Load data
6. [Markdown] ## Exploratory Data Analysis
7. [Code]     # EDA cells
8. [Markdown] ## Feature Engineering
9. [Code]     # Feature engineering
10. [Markdown] ## Modeling
11. [Code]     # Train/test split, model, evaluation
12. [Markdown] ## Results
13. [Code]     # Final metrics and visualizations
```

### Idempotency
Ensure cells can be re-run safely:
```python
# ❌ Appends on re-run
results_list.append(new_result)

# ✅ Idempotent
results_list = [new_result]
```

## Converting Notebooks

```bash
# To Python script
jupyter nbconvert --to script notebook.ipynb

# To HTML report
jupyter nbconvert --to html --execute notebook.ipynb

# Execute and save with papermill
papermill notebook.ipynb output.ipynb -p param1 value1 -p param2 value2
```

## Debugging in Notebooks

```python
# Quick profiling
%timeit expensive_function(data)

# Line profiling
%load_ext line_profiler
%lprun -f slow_function slow_function(data)

# Memory profiling
%load_ext memory_profiler
%memit expensive_operation()

# Debug with pdb
import pdb; pdb.set_trace()  # breakpoint
# Or modern Python:
breakpoint()
```

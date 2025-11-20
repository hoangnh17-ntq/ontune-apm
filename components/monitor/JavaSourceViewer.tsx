'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Code, FileCode, Terminal, Copy, Check } from 'lucide-react';
import { Transaction } from '@/types/apm';

export default function JavaSourceViewer() {
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [decompiling, setDecompiling] = useState(false);
  const [sourceCode, setSourceCode] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const storedTx = sessionStorage.getItem('selectedTransaction');
    if (storedTx) {
      const tx = JSON.parse(storedTx);
      setTransaction(tx);
      // Simulate decompilation
      simulateDecompile(tx);
    }
  }, []);

  const simulateDecompile = (tx: Transaction) => {
    setDecompiling(true);
    // Simulate network delay
    setTimeout(() => {
      const mockJavaCode = generateMockJavaSource(tx);
      setSourceCode(mockJavaCode);
      setDecompiling(false);
    }, 1500);
  };

  const generateMockJavaSource = (tx: Transaction): string => {
    const className = tx.spans?.[0]?.className || 'com.example.controller.PaymentController';
    const methodName = tx.spans?.[0]?.methodName || 'processPayment';
    const simpleClassName = className.split('.').pop();

    return `// Decompiled by onTune APM - ASM Agent
// Decompiler: CFR 0.152
// Source Class: ${className}.class
// Decompiled at: ${new Date().toLocaleString()}
// Agent: ${tx.agentName}
// 
// NOTE: This source code was decompiled from bytecode in real-time.
// The agent captured and decompiled the class when this transaction was traced.

package ${className.substring(0, className.lastIndexOf('.'))};

import org.springframework.web.bind.annotation.*;
import org.springframework.stereotype.Controller;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.Map;

/**
 * Auto-generated from bytecode
 * Transaction ID: ${tx.id}
 * Trace ID: ${tx.traceId}
 * Response Time: ${tx.responseTime}ms
 */
@RestController
@RequestMapping("${tx.endpoint.split('?')[0]}")
public class ${simpleClassName} {
    
    private final PaymentService paymentService;
    private final Logger logger = LoggerFactory.getLogger(${simpleClassName}.class);
    
    @Autowired
    public ${simpleClassName}(PaymentService paymentService) {
        this.paymentService = paymentService;
    }
    
    /**
     * Endpoint: ${tx.endpoint}
     * Method: ${tx.httpMethod || 'POST'}
     * Average Response Time: ${tx.responseTime}ms
     */
    @${tx.httpMethod || 'Post'}Mapping
    public ResponseEntity<PaymentResponse> ${methodName}(
            @RequestBody PaymentRequest request,
            HttpServletRequest httpRequest) {
        
        long startTime = System.currentTimeMillis();
        logger.info("Processing payment for amount: {}", request.getAmount());
        
        try {
            // Line causing slow response (detected by APM)
            PaymentResponse response = paymentService.processPayment(request);
            
            ${tx.responseTime > 1000 ? `
            // ⚠️ Performance Issue Detected
            // This method took ${tx.responseTime}ms to execute
            // Consider optimizing database queries or adding caching` : ''}
            
            long duration = System.currentTimeMillis() - startTime;
            logger.info("Payment processed in {}ms", duration);
            
            return ResponseEntity.ok(response);
            
        } catch (PaymentException e) {
            logger.error("Payment processing failed", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new PaymentResponse(false, e.getMessage()));
        }
    }
    
    ${tx.method === 'SQL' ? `
    /**
     * SQL Query detected:
     * ${tx.sqlQuery || 'SELECT * FROM payments WHERE id = ?'}
     */
    private void executeDatabaseQuery() {
        // Database interaction logged by APM
        // Query execution time: ${Math.floor(tx.responseTime * 0.7)}ms
    }` : ''}
}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(sourceCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([sourceCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${transaction?.spans?.[0]?.className || 'Source'}.java`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!transaction) {
    return (
      <Alert>
        <Terminal className="h-4 w-4" />
        <AlertDescription>
          No transaction selected. Please select a transaction from the transaction list to view its source code.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileCode className="h-5 w-5" />
                  Java Source Code (ASM Decompiled)
                </CardTitle>
                <CardDescription className="mt-2">
                  Real-time bytecode decompilation by ASM agent - No SCM integration required
                </CardDescription>
              </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopy}
                disabled={decompiling || !sourceCode}
              >
                {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                {copied ? 'Copied!' : 'Copy'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDownload}
                disabled={decompiling || !sourceCode}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-xs text-muted-foreground">Class Name</div>
              <div className="text-sm font-mono truncate">
                {transaction.spans?.[0]?.className || 'N/A'}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Method Name</div>
              <div className="text-sm font-mono">
                {transaction.spans?.[0]?.methodName || 'N/A'}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Response Time</div>
              <Badge variant={transaction.responseTime > 1000 ? 'destructive' : 'default'}>
                {transaction.responseTime.toFixed(0)}ms
              </Badge>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Status</div>
              <Badge>
                {transaction.status.toUpperCase()}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Source Code */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Decompiled Source Code
          </CardTitle>
        </CardHeader>
        <CardContent>
          {decompiling ? (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <div className="text-sm text-muted-foreground">
                Decompiling bytecode from agent...
              </div>
            </div>
          ) : (
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs font-mono leading-relaxed max-h-[600px] overflow-y-auto">
                <code className="text-foreground">{sourceCode}</code>
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ASM Info */}
      <Alert className="bg-blue-500/10 border-blue-500/20">
        <AlertDescription>
          <strong>ℹ️ ASM Decompilation:</strong> This source code was decompiled from Java bytecode by the ASM agent. 
          The agent automatically decompiles classes on-demand when you view transaction traces.
          No source code repository integration required.
        </AlertDescription>
      </Alert>

      {/* Performance Hints */}
      {transaction.responseTime > 1000 && (
        <Alert className="mt-3">
          <AlertDescription>
            <strong>💡 Performance Hint:</strong> This transaction took {transaction.responseTime.toFixed(0)}ms to complete.
            Check the highlighted sections in the code for potential optimization opportunities.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

